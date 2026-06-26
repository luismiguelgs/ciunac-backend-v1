# Seguridad

## Capas actuales

| Capa | Implementacion | Ubicacion |
| --- | --- | --- |
| CORS | Origenes permitidos y credenciales | `src/main.ts` |
| Helmet | Headers HTTP basicos | `src/main.ts` |
| API key | Header `x-api-key` contra `API_KEY` | `ApiKeyGuard` |
| JWT | Bearer token firmado con `JWT_ACCESS_SECRET` | `JwtAuthGuard`, `JwtStrategy` |
| Permisos | Decorador `@RequirePermissions` y guard | `PermissionsGuard` |
| Validacion | `ValidationPipe` global con whitelist | `src/main.ts` |
| OpenAPI | Contrato Swagger solo fuera de produccion | `/api/docs`, `/api/docs-json` |

## Variables sensibles

- `API_KEY`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET` si se reactiva refresh token
- `EXCEPTION_ROLE`
- `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`
- `MONGO_URI`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_*`
- `ALUMNOS_EMAIL_USER`, `ALUMNOS_EMAIL_PASSWORD`
- `CERT_EMAIL_USER`, `CERT_EMAIL_PASSWORD`
- `RECAUDA_EMAIL_USER`, `RECAUDA_EMAIL_PASSWORD`
- `API_KEY_Q10`

## Riesgos observados

- Algunos controllers de `seguimiento_docente` no declaran guards a nivel de clase: `cumplimiento-docente`, `dashboard-docentes`, `encuesta-metricas-docente`, `encuesta-preguntas`, `encuesta-respuestas-detalle`, `perfil-docente-resultados`, `puntaje-academico-administrativo`.
- Hay comentarios de `JwtAuthGuard` deshabilitado en varios controllers CRUD que actualmente dependen de `ApiKeyGuard`.
- Varias respuestas de error usan `throw new Error`, lo que puede producir codigos HTTP menos precisos.
- Swagger/OpenAPI ya documenta esquemas `api-key` y `jwt`; las rutas sin guard visible aparecen sin seguridad y deben revisarse antes de exponer nuevas superficies.

## Politica recomendada

- Todo endpoint administrativo debe requerir `ApiKeyGuard`.
- Todo endpoint que opere datos de usuario autenticado debe requerir JWT.
- Operaciones de gestion deben usar `PermissionsGuard` y `@RequirePermissions`.
- Endpoints publicos deben declararse explicitamente en esta documentacion con razon de negocio.
- Secrets nunca deben registrarse en logs ni documentarse con valores reales.
