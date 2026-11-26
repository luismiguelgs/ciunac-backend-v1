import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import {
  BadRequestException,
  HttpException,
  INestApplication,
  Logger,
  PayloadTooLargeException,
  ValidationPipe,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ArgumentsHost, Catch } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response, NextFunction, json } from 'express';

export type Q10Stage =
  | 'REQUEST_VALIDATION'
  | 'LOCAL_VALIDATION'
  | 'PERIOD_LOOKUP'
  | 'REMOTE_CREATE'
  | 'LOCAL_SYNC'
  | 'ENROLLMENT_LOOKUP'
  | 'PROGRAM_REGISTRATION'
  | 'COMPLETED';
type Effect = 'not_attempted' | 'confirmed' | 'unknown';
export interface Q10Operation {
  operationId: string;
  correlationId?: string;
  stage: Q10Stage;
  remoteStudent: Effect;
  localStudent: Effect;
  program: Effect;
  upstreamStatus?: number;
}
export interface Q10ValidationIssue {
  field: string;
  rules: string[];
}
export const q10Operations = new AsyncLocalStorage<Q10Operation>();
const logger = new Logger('Q10Registration');
const fields = new Set([
  'Primer_nombre',
  'Segundo_nombre',
  'Primer_apellido',
  'Segundo_apellido',
  'Email',
  'Codigo_tipo_identificacion',
  'Numero_identificacion',
  'Genero',
  'Fecha_nacimiento',
  'Telefono',
  'Celular',
  'Direccion',
  'Lugar_nacimiento',
  'Lugar_residencia',
  'Codigo_programa',
  'Consecutivo_sedejornada',
  'Consecutivo_periodo',
  'facultadId',
  'escuelaId',
  'tipoEstudiante',
  'codigo',
  'imgDoc',
]);
const rules = new Set([
  'isNotEmpty',
  'isString',
  'isEmail',
  'isEnum',
  'isIn',
  'isInt',
  'min',
  'isNumber',
  'isUrl',
  'isLength',
  'isDateString',
  'matches',
  'whitelistValidation',
  'FACULTY_NOT_FOUND',
  'SCHOOL_NOT_FOUND',
  'SCHOOL_FACULTY_MISMATCH',
  'SCHOOL_UNCLASSIFIED',
  'SCHOOL_TYPE_MISMATCH',
]);
const codes = new Set([
  'Q10_REQUEST_VALIDATION_FAILED',
  'Q10_INVALID_JSON',
  'Q10_REQUEST_TOO_LARGE',
  'Q10_LOCAL_VALIDATION_FAILED',
  'Q10_PERIOD_LOOKUP_FAILED',
  'Q10_STUDENT_CREATION_REJECTED',
  'Q10_UNAVAILABLE',
  'Q10_CREATED_INVALID_RESPONSE',
  'Q10_CREATED_LOCAL_SYNC_FAILED',
  'Q10_CREATED_PROGRAM_PENDING',
  'Q10_ID_CONFLICT',
  'Q10_ID_ALREADY_LINKED',
]);

export function safeIssues(value: unknown): Q10ValidationIssue[] {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const issue = item as Record<string, unknown>;
    const field =
      typeof issue.field === 'string' && fields.has(issue.field)
        ? issue.field
        : 'unknown';
    const accepted = Array.isArray(issue.rules)
      ? issue.rules.filter(
          (rule): rule is string => typeof rule === 'string' && rules.has(rule),
        )
      : [];
    return accepted.length ? [{ field, rules: [...new Set(accepted)] }] : [];
  });
}

export function q10Stage(stage: Q10Stage): void {
  const operation = q10Operations.getStore();
  if (operation) {
    operation.stage = stage;
    delete operation.upstreamStatus;
  }
}

export function q10HttpStatus(status: number): void {
  const operation = q10Operations.getStore();
  if (operation && Number.isInteger(status) && status >= 100 && status <= 599) {
    operation.upstreamStatus = status;
  }
}

export function q10Effect(
  key: 'remoteStudent' | 'localStudent' | 'program',
  value: Effect,
): void {
  const operation = q10Operations.getStore();
  if (operation) operation[key] = value;
}

export class Q10ValidationPipe extends ValidationPipe {
  createExceptionFactory(): (errors?: ValidationError[]) => unknown {
    const fallback = super.createExceptionFactory();
    return (errors = []) => {
      if (!q10Operations.getStore()) return fallback(errors);
      return new BadRequestException({
        code: 'Q10_REQUEST_VALIDATION_FAILED',
        message: 'Los datos del estudiante no son validos',
        validationErrors: safeIssues(
          errors.map((error) => ({
            field: error.property,
            rules: Object.keys(error.constraints ?? {}),
          })),
        ),
      });
    };
  }
}

@Catch()
class Q10ExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const operation = q10Operations.getStore();
    if (!operation) return super.catch(exception, host);
    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const raw =
      exception instanceof HttpException ? exception.getResponse() : null;
    const body =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const parserError = exception as { type?: string } | null;
    const invalidJson = parserError?.type === 'entity.parse.failed';
    const code = invalidJson
      ? 'Q10_INVALID_JSON'
      : typeof body.code === 'string' && codes.has(body.code)
        ? body.code
        : status === 401
          ? 'Q10_UNAUTHORIZED'
          : status === 400
            ? 'Q10_REQUEST_VALIDATION_FAILED'
            : 'Q10_INTERNAL_ERROR';
    const httpStatus = invalidJson ? 400 : status;
    const validationErrors = safeIssues(body.validationErrors);
    const origin =
      operation.stage === 'REQUEST_VALIDATION'
        ? 'request'
        : [
              'PERIOD_LOOKUP',
              'REMOTE_CREATE',
              'ENROLLMENT_LOOKUP',
              'PROGRAM_REGISTRATION',
            ].includes(operation.stage)
          ? 'q10'
          : 'local';
    const details = {
      operationId: operation.operationId,
      stage: operation.stage,
      origin,
      retryAllowed: false,
      validationErrors,
    };
    // Never pass exceptions, messages or request objects to the logger.
    const event = JSON.stringify({
      event: 'q10.student.registration.failed',
      timestamp: new Date().toISOString(),
      ...operation,
      httpStatus,
      code,
      origin,
      validationErrors,
    });
    if (httpStatus >= 500) logger.error(event);
    else logger.warn(event);
    const response = host.switchToHttp().getResponse<Response>();
    const message =
      codes.has(code) && typeof body.message === 'string'
        ? body.message
        : invalidJson
          ? 'El JSON enviado no es valido'
          : 'No fue posible completar el registro del estudiante';
    // Preserve existing partial-result identifiers in responses, never in logs.
    response.status(httpStatus).json({
      statusCode: httpStatus,
      code,
      message,
      ...details,
      ...(typeof body.estudianteId === 'string'
        ? { estudianteId: body.estudianteId }
        : {}),
      ...(typeof body.idQ10 === 'string' ? { idQ10: body.idQ10 } : {}),
    });
  }
}

export function configureQ10Diagnostics(app: INestApplication): void {
  const parseJson = json();
  app.use((request: Request, response: Response, next: NextFunction) => {
    if (
      request.method !== 'POST' ||
      !/^\/q10\/estudiantes\/?$/i.test(request.path)
    )
      return next();
    const operationId = randomUUID();
    const correlation = request.headers['x-correlation-id'];
    const correlationId =
      typeof correlation === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        correlation,
      )
        ? correlation
        : undefined;
    response.setHeader('X-Operation-Id', operationId);
    q10Operations.run(
      {
        operationId,
        correlationId,
        stage: 'REQUEST_VALIDATION',
        remoteStudent: 'not_attempted',
        localStudent: 'not_attempted',
        program: 'not_attempted',
      },
      () =>
        parseJson(request, response, (error?: { type?: string }) => {
          // Nest otherwise replaces SyntaxError and loses the parser's stable type.
          if (error?.type === 'entity.parse.failed') {
            return next(
              new BadRequestException({
                code: 'Q10_INVALID_JSON',
                message: 'El JSON enviado no es valido',
              }),
            );
          }
          if (error?.type === 'entity.too.large') {
            return next(
              new PayloadTooLargeException({
                code: 'Q10_REQUEST_TOO_LARGE',
                message: 'El JSON excede el limite permitido',
              }),
            );
          }
          next(error);
        }),
    );
  });
  app.useGlobalFilters(new Q10ExceptionFilter(app.getHttpAdapter()));
}
