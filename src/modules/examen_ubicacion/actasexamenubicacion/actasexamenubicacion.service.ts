import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model, Types } from 'mongoose';
import { In, Repository } from 'typeorm';
import { Solicitud } from 'src/modules/administrativas/solicitudes/entities/solicitud.entity';
import { Detallesubicacion } from '../detallesubicacion/entities/detallesubicacion.entity';
import { Examenesubicacion } from '../examenesubicacion/entities/examenesubicacion.entity';
import { ActaExamenUbicacionResponseDto } from './dto/acta-examen-ubicacion-response.dto';
import { CreateActasexamenubicacionDto } from './dto/create-actasexamenubicacion.dto';
import { UpdateActasexamenubicacionDto } from './dto/update-actasexamenubicacion.dto';
import { ActaGenerator } from './interfaces/acta-generator.interface';
import {
  ActaExamenUbicacion,
  ActaExamenUbicacionDocument,
  ParticipanteActa,
} from './schemas/actasexamenubicacion.schema';

const TIPO_SOLICITUD_EXAMEN_UBICACION = 7;
const ESTADO_SOLICITUD_TERMINADO = 3;

type ValidationIssue = {
  detalleId: number;
  motivo: string;
};

@Injectable()
export class ActasexamenubicacionService implements OnModuleInit {
  private readonly logger = new Logger(ActasexamenubicacionService.name);

  constructor(
    @InjectModel(ActaExamenUbicacion.name)
    private readonly actasExamenUbicacionModel: Model<ActaExamenUbicacionDocument>,
    @InjectRepository(Examenesubicacion)
    private readonly examenesubicacionRepository: Repository<Examenesubicacion>,
    @InjectRepository(Detallesubicacion)
    private readonly detallesubicacionRepository: Repository<Detallesubicacion>,
    @InjectRepository(Solicitud)
    private readonly solicitudesRepository: Repository<Solicitud>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.actasExamenUbicacionModel.init();
  }

  async create(
    createDto: CreateActasexamenubicacionDto,
    generador: ActaGenerator,
  ): Promise<ActaExamenUbicacionResponseDto> {
    const existente = await this.findByExamenId(createDto.examenId);
    if (existente) {
      this.throwActaYaExiste(existente);
    }

    const examen = await this.examenesubicacionRepository.findOne({
      where: { id: createDto.examenId },
      relations: [
        'estado',
        'idioma',
        'docente',
        'aula',
      ],
    });

    if (!examen) {
      throw this.notFound(
        'EXAMEN_NO_ENCONTRADO',
        `Examen de ubicaci?n ${createDto.examenId} no encontrado`,
      );
    }

    if (!examen.estado || !examen.aula || !examen.docente || !examen.idioma) {
      throw this.internalError(
        'CONFIGURACION_INCOMPLETA',
        'El examen no tiene todas sus relaciones configuradas',
      );
    }

    if (examen.estadoId !== 8) {
      throw this.conflict(
        'EXAMEN_NO_CERRADO',
        'El examen debe estar TERMINADO para generar el acta',
      );
    }

    const detalles = await this.detallesubicacionRepository.find({
      where: { examenId: examen.id, activo: true },
      relations: ['estudiante', 'nivel', 'calificacion', 'calificacion.ciclo'],
      order: {
        estudiante: {
          apellidos: 'ASC',
          nombres: 'ASC',
        },
      },
    });

    if (detalles.length === 0) {
      throw this.conflict(
        'PARTICIPANTES_INCOMPLETOS',
        'El examen no tiene participantes activos',
      );
    }

    const solicitudIds = [
      ...new Set(detalles.map((detalle) => detalle.solicitudId)),
    ];
    const solicitudes = await this.solicitudesRepository.find({
      where: { id: In(solicitudIds) },
    });
    const solicitudesPorId = new Map(
      solicitudes.map((solicitud) => [solicitud.id, solicitud]),
    );

    const participantes: ParticipanteActa[] = [];
    const incidencias: ValidationIssue[] = [];

    for (const detalle of detalles) {
      const solicitud = solicitudesPorId.get(detalle.solicitudId);

      if (
        !detalle.estudiante ||
        !detalle.nivel ||
        !detalle.calificacion ||
        !detalle.calificacion.ciclo
      ) {
        incidencias.push({
          detalleId: detalle.id,
          motivo: 'RESULTADO_INCOMPLETO',
        });
        continue;
      }

      if (!solicitud) {
        incidencias.push({
          detalleId: detalle.id,
          motivo: 'SOLICITUD_NO_ENCONTRADA',
        });
        continue;
      }

      const numeroVoucher = solicitud.numeroVoucher?.trim();
      const nota = Number(detalle.nota);
      let motivo: string | null = null;

      if (!detalle.terminado) {
        motivo = 'PARTICIPANTE_NO_TERMINADO';
      } else if (!Number.isFinite(nota) || nota < 0 || nota > 100) {
        motivo = 'NOTA_INVALIDA';
      } else if (detalle.idiomaId !== examen.idiomaId) {
        motivo = 'IDIOMA_DETALLE_NO_COINCIDE';
      } else if (
        solicitud.tipoSolicitudId !== TIPO_SOLICITUD_EXAMEN_UBICACION
      ) {
        motivo = 'TIPO_SOLICITUD_INVALIDO';
      } else if (solicitud.estadoId !== ESTADO_SOLICITUD_TERMINADO) {
        motivo = 'SOLICITUD_NO_VALIDADA';
      } else if (solicitud.estudianteId !== detalle.estudianteId) {
        motivo = 'ESTUDIANTE_NO_COINCIDE';
      } else if (solicitud.idiomaId !== examen.idiomaId) {
        motivo = 'IDIOMA_SOLICITUD_NO_COINCIDE';
      } else if (!numeroVoucher) {
        motivo = 'VOUCHER_FALTANTE';
      }

      if (motivo) {
        incidencias.push({ detalleId: detalle.id, motivo });
        continue;
      }

      const ciclo = detalle.calificacion.ciclo;
      participantes.push({
        detalleId: detalle.id,
        estudianteId: detalle.estudianteId,
        solicitudId: solicitud.id,
        numeroVoucher,
        tipoDocumento: detalle.estudiante.tipoDocumento,
        dni: detalle.estudiante.numeroDocumento,
        apellidos: detalle.estudiante.apellidos,
        nombres: detalle.estudiante.nombres,
        nivelId: detalle.nivelId,
        nivel: detalle.nivel.nombre,
        calificacionId: detalle.calificacionId,
        cicloId: ciclo.id,
        ciclo: ciclo.nombre,
        cicloCodigo: ciclo.codigo,
        nota,
        ubicacion: ciclo.nombre,
        terminado: true,
      });
    }

    if (incidencias.length > 0) {
      throw this.conflict(
        'PARTICIPANTES_INCOMPLETOS',
        'Existen participantes sin informaci?n v?lida para el acta',
        { detalles: incidencias },
      );
    }

    const nombreDocente =
      `${examen.docente.nombres} ${examen.docente.apellidos}`.trim();
    let actaCreada: ActaExamenUbicacionDocument;

    try {
      actaCreada = await this.actasExamenUbicacionModel.create({
        schemaVersion: 2,
        examenId: examen.id,
        codigo: examen.codigo,
        fecha: examen.fecha,
        estadoExamen: examen.estado.nombre,
        salon: examen.aula.nombre,
        docente: nombreDocente,
        idioma: examen.idioma.nombre,
        aula: {
          id: examen.aula.id,
          nombre: examen.aula.nombre,
          tipo: examen.aula.tipo,
          ubicacion: examen.aula.ubicacion ?? '',
        },
        docenteDetalle: {
          id: examen.docente.id,
          nombres: examen.docente.nombres,
          apellidos: examen.docente.apellidos,
        },
        idiomaDetalle: {
          id: examen.idioma.id,
          nombre: examen.idioma.nombre,
        },
        generadoPor: generador,
        participantes,
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        const duplicada = await this.findByExamenId(examen.id);
        this.throwActaYaExiste(duplicada);
      }
      throw this.internalError(
        'ERROR_PERSISTENCIA_ACTA',
        'No se pudo guardar el acta en MongoDB',
      );
    }

    try {
      await this.examenesubicacionRepository.update(examen.id, {
        estadoId: 13,
        actaId: String(actaCreada._id),
        modificadoEn: new Date(),
      });
    } catch (error) {
      await this.compensateActa(actaCreada, examen.id, error);
      throw this.internalError(
        'ERROR_PERSISTENCIA_ACTA',
        'No se pudo actualizar el estado del examen en PostgreSQL',
      );
    }

    return this.toResponse(actaCreada.toObject());
  }

  async findAll(): Promise<ActaExamenUbicacionResponseDto[]> {
    const actas = await this.actasExamenUbicacionModel
      .find()
      .sort({ creado_en: -1 })
      .lean()
      .exec();
    return actas.map((acta) => this.toResponse(acta));
  }

  async findOne(id: string): Promise<ActaExamenUbicacionResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'VALIDACION_FALLIDA',
        message: 'El identificador del acta no es v?lido',
      });
    }

    const acta = await this.actasExamenUbicacionModel
      .findById(id)
      .lean()
      .exec();

    if (!acta) {
      throw this.notFound(
        'ACTA_NO_ENCONTRADA',
        `Acta de examen de ubicaci?n ${id} no encontrada`,
      );
    }

    return this.toResponse(acta);
  }

  update(_id: string, _dto: UpdateActasexamenubicacionDto): never {
    throw this.conflict(
      'ACTA_INMUTABLE',
      'Las actas publicadas no pueden modificarse',
    );
  }

  remove(_id: string): never {
    throw this.conflict(
      'ACTA_INMUTABLE',
      'Las actas publicadas no pueden eliminarse',
    );
  }

  private async findByExamenId(
    examenId: number,
  ): Promise<Record<string, unknown> | null> {
    return this.actasExamenUbicacionModel
      .findOne({ examenId })
      .lean()
      .exec() as Promise<Record<string, unknown> | null>;
  }

  private async compensateActa(
    acta: ActaExamenUbicacionDocument,
    examenId: number,
    originalError: unknown,
  ): Promise<void> {
    try {
      await this.actasExamenUbicacionModel.deleteOne({ _id: acta._id }).exec();
    } catch (compensationError) {
      this.logger.error(
        `No se pudo compensar el acta del examen ${examenId}: ${this.errorMessage(compensationError)}`,
      );
    }

    this.logger.error(
      `Fallo al actualizar el estado del examen ${examenId}: ${this.errorMessage(originalError)}`,
    );
  }

  private throwActaYaExiste(acta: Record<string, unknown> | null): never {
    const actaId = acta?._id ? String(acta._id) : undefined;
    throw this.conflict(
      'ACTA_YA_EXISTE',
      'Ya existe un acta para este examen',
      actaId ? { actaId } : undefined,
    );
  }

  private toResponse(document: unknown): ActaExamenUbicacionResponseDto {
    const source = document as Record<string, unknown>;
    const id = String(source._id);
    return Object.assign(new ActaExamenUbicacionResponseDto(), source, {
      _id: id,
      id,
    });
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }

  private conflict(
    code: string,
    message: string,
    extra?: Record<string, unknown>,
  ): ConflictException {
    return new ConflictException({
      statusCode: 409,
      code,
      message,
      ...extra,
    });
  }

  private notFound(code: string, message: string): NotFoundException {
    return new NotFoundException({ statusCode: 404, code, message });
  }

  private internalError(
    code: string,
    message: string,
  ): InternalServerErrorException {
    return new InternalServerErrorException({
      statusCode: 500,
      code,
      message,
    });
  }
}
