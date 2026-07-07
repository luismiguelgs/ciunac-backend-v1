import { OpenAPIObject } from '@nestjs/swagger';
import { decorateOpenApiDocument } from './openapi-metadata';

const createDocument = (): OpenAPIObject =>
  ({
    openapi: '3.0.0',
    info: {
      title: 'Test API',
      version: '1.0.0',
    },
    paths: {
      '/solicitudes/{id}/rechazo': {
        patch: {
          responses: {},
        },
      },
      '/solicitudes/{id}': {
        delete: {
          responses: {},
        },
      },
      '/auth/login': {
        post: {
          responses: {},
        },
      },
      '/auth/profile': {
        get: {
          responses: {},
        },
      },
      '/pagos-banco/upload': {
        post: {
          responses: {},
        },
      },
      '/actasexamenubicacion': {
        post: {
          responses: {},
        },
        get: {
          responses: {},
        },
      },
      '/actasexamenubicacion/{id}': {
        patch: {
          responses: {},
        },
        delete: {
          responses: {},
        },
      },
    },
    components: {},
  }) as OpenAPIObject;

describe('decorateOpenApiDocument', () => {
  it('agrega tags, seguridad y respuestas estandar por dominio', () => {
    const document = decorateOpenApiDocument(createDocument());
    const operation = document.paths['/solicitudes/{id}/rechazo'].patch as any;

    expect(operation.tags).toEqual(['Administrativas']);
    expect(operation.security).toEqual([{ 'api-key': [] }]);
    expect(operation.responses['400']).toBeDefined();
    expect(operation.responses['401']).toBeDefined();
    expect(operation.responses['403']).toBeDefined();
    expect(operation.responses['404']).toBeDefined();
  });

  it('mantiene endpoints publicos sin seguridad', () => {
    const document = decorateOpenApiDocument(createDocument());
    const operation = document.paths['/auth/login'].post as any;

    expect(operation.tags).toEqual(['Authentication']);
    expect(operation.security).toEqual([]);
  });

  it('documenta endpoints con API key y JWT cuando aplica', () => {
    const document = decorateOpenApiDocument(createDocument());
    const operation = document.paths['/auth/profile'].get as any;

    expect(operation.security).toEqual([{ 'api-key': [], jwt: [] }]);
  });

  it('marca el rechazo legado por DELETE como deprecado', () => {
    const document = decorateOpenApiDocument(createDocument());
    const operation = document.paths['/solicitudes/{id}'].delete as any;

    expect(operation.deprecated).toBe(true);
    expect(operation.description).toContain('PATCH /solicitudes/{id}/rechazo');
  });

  it('protege la escritura de actas y depreca su mutacion', () => {
    const document = decorateOpenApiDocument(createDocument());
    const postOperation = document.paths['/actasexamenubicacion'].post as any;
    const patchOperation = document.paths['/actasexamenubicacion/{id}']
      .patch as any;
    const deleteOperation = document.paths['/actasexamenubicacion/{id}']
      .delete as any;

    expect(postOperation.security).toEqual([{ 'api-key': [], jwt: [] }]);
    expect(patchOperation.security).toEqual([{ 'api-key': [], jwt: [] }]);
    expect(deleteOperation.security).toEqual([{ 'api-key': [], jwt: [] }]);
    expect(patchOperation.deprecated).toBe(true);
    expect(deleteOperation.deprecated).toBe(true);
    expect(patchOperation.description).toContain('inmutables');
  });

  it('documenta cargas multipart para CSV', () => {
    const document = decorateOpenApiDocument(createDocument());
    const operation = document.paths['/pagos-banco/upload'].post as any;

    expect(operation.requestBody.content['multipart/form-data']).toBeDefined();
    expect(
      operation.requestBody.content['multipart/form-data'].schema.properties
        .file.format,
    ).toBe('binary');
  });
});
