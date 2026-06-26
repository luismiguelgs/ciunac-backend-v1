# Swagger / OpenAPI

## Objetivo

El backend expone una documentacion OpenAPI generada desde los controllers y DTOs NestJS. Esta documentacion sirve como contrato tecnico para frontend, QA y futuras integraciones.

## Rutas

| Recurso | Ruta | Ambiente |
| --- | --- | --- |
| Swagger UI | `/api/docs` | Solo cuando `NODE_ENV !== "production"` |
| OpenAPI JSON | `/api/docs-json` | Solo cuando `NODE_ENV !== "production"` |

En produccion no se monta Swagger para evitar exponer contratos internos sin control adicional.

## Seguridad documentada

El contrato define dos esquemas:

- `api-key`: header `x-api-key`, usado por `ApiKeyGuard`.
- `jwt`: Bearer token, usado por `JwtAuthGuard` o `AuthGuard('jwt')`.

La metadata de OpenAPI marca por ruta si el endpoint requiere API key, JWT, ambos o ningun esquema visible en el codigo actual. Los endpoints sin guard visible quedan sin seguridad en Swagger y deben revisarse como parte del hardening.

## Generacion de schemas

La configuracion usa el plugin `@nestjs/swagger` en `nest-cli.json` con:

- `classValidatorShim: true`, para reflejar validaciones de `class-validator`.
- `introspectComments: true`, para usar comentarios en DTOs cuando existan.
- `dtoFileNameSuffix: [".dto.ts", ".entity.ts"]`, para incluir DTOs y entidades en metadata.

Los DTOs basados en `PartialType` deben importarlo desde `@nestjs/swagger` para heredar metadata OpenAPI correctamente.

## Multipart y archivos

El contrato documenta como `multipart/form-data`:

- `POST /upload/{folder}` para cargas hacia Google Drive.
- `POST /pagos-banco/upload` para CSV bancario.
- `POST /encuesta-respuestas/upload` para CSV de respuestas docentes.

## Reglas de mantenimiento

- Todo controller nuevo debe quedar visible en `/api/docs-json`.
- Todo endpoint con body debe recibir un DTO validado.
- Todo endpoint protegido debe tener su seguridad reflejada en `src/config/openapi-metadata.ts`.
- Todo upload debe tener `multipart/form-data` definido en `src/config/openapi-metadata.ts`.
- Todo endpoint legado debe marcarse como `deprecated`.
- Si un endpoint cambia de ruta, actualizar tambien `docs/api/endpoints.md` y el spec de caso de uso afectado.

## Verificacion recomendada

```bash
npm run build
npx jest src/config/openapi-metadata.spec.ts src/config/swagger.config.spec.ts --runInBand
```

Para revisar manualmente en desarrollo:

```bash
npm run start:dev
```

Luego abrir `http://localhost:3000/api/docs` o consumir `http://localhost:3000/api/docs-json`.
