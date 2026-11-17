import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { decorateOpenApiDocument } from './openapi-metadata';
import { ModulesContainer } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../modules/authentication/auth/decorators/permissions.decorator';
// Keep the runtime document and the exported snapshot on the same app version.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { version } = require('../../package.json') as { version: string };

export const SWAGGER_UI_PATH = 'api/docs';
export const SWAGGER_JSON_PATH = 'api/docs-json';

export const isSwaggerEnabled = (
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean => nodeEnv !== 'production';

export const createSwaggerDocument = (app: INestApplication): OpenAPIObject => {
  const config = new DocumentBuilder()
    .setTitle('CIUNAC Backend API')
    .setDescription(
      'Contrato OpenAPI del backend CIUNAC. Incluye dominios academicos, administrativos, autenticacion, seguimiento docente, Q10, cargas y correo.',
    )
    .setVersion(version)
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description:
          'API key requerida por endpoints protegidos con ApiKeyGuard.',
      },
      'api-key',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT emitido por el modulo de autenticacion.',
      },
      'jwt',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
    operationIdFactory: (controllerKey: string, methodKey: string) =>
      `${controllerKey}_${methodKey}`,
  });

  const permissions = new Map<string, string[]>();
  for (const module of app.get(ModulesContainer).values()) {
    for (const wrapper of module.controllers.values()) {
      const controller = wrapper.metatype;
      if (!controller) continue;
      const prototype: unknown = controller.prototype;
      if (!prototype || typeof prototype !== 'object') continue;
      for (const method of Object.getOwnPropertyNames(prototype)) {
        const handler: unknown = Reflect.get(prototype, method);
        if (typeof handler !== 'function') continue;
        const declared: unknown = Reflect.getMetadata(PERMISSIONS_KEY, handler);
        permissions.set(
          `${controller.name}_${method}`,
          Array.isArray(declared)
            ? declared.filter(
                (value: unknown): value is string => typeof value === 'string',
              )
            : [],
        );
      }
    }
  }
  for (const item of Object.values(document.paths)) {
    for (const operation of Object.values(item) as unknown[]) {
      if (
        operation &&
        typeof operation === 'object' &&
        'operationId' in operation &&
        typeof operation.operationId === 'string'
      ) {
        const target = operation as {
          operationId: string;
          'x-permissions'?: string[];
        };
        target['x-permissions'] = permissions.get(target.operationId) ?? [];
      }
    }
  }
  return decorateOpenApiDocument(document);
};

export const setupSwagger = (app: INestApplication): void => {
  if (!isSwaggerEnabled()) {
    return;
  }

  const document = createSwaggerDocument(app);

  SwaggerModule.setup(SWAGGER_UI_PATH, app, document, {
    jsonDocumentUrl: `/${SWAGGER_JSON_PATH}`,
    customSiteTitle: 'CIUNAC API Docs',
    swaggerOptions: {
      displayRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  });
};
