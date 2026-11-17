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

## Exámenes de ubicación

### Estado actual

Cronograma, examenes, rangos y detalles aplican ApiKeyGuard. Actas aplica API key en todas las rutas; POST, PATCH y DELETE agregan JWT + PermissionsGuard con gestionar_examen_ubicacion. Las consultas de actas solo exigen API key. Logout exige API key + JWT, pero no revoca access tokens.

### Propuestas separadas del estado actual

- Conservar la API key para identificar al cliente.
- Exigir JWT y el permiso `gestionar_examen_ubicacion` para crear, modificar, cerrar o generar actas.
- Aplicar autorización antes de consultar PostgreSQL o MongoDB.
- No incluir número de voucher, documento completo ni secretos en logs.
- Rechazar campos adicionales en `POST /actasexamenubicacion`; el DTO público acepta solo `examenId`.
- Mantener `PATCH` y `DELETE` de actas como rutas legadas deprecadas y rechazar actas publicadas con `409 ACTA_INMUTABLE`.

Estos controles no cambian las URI existentes.

## Superficie publica explicita

Son publicas GET /, GET /login y GET /validar; registro, login, forgot-password y reset-password de auth; y las operaciones de cumplimiento-docente, dashboard-docentes, encuesta-metricas-docente, encuesta-preguntas, encuesta-respuestas-detalle, perfil-docente-resultados y puntaje-academico-administrativo. No hay autorizacion global que complete guards ausentes.

El [inventario](../api/endpoints.md) enumera cada operacion y permiso desde los decoradores actuales. Las pruebas SEC comprueban paridad, 401 sin credenciales y 403 cuando existe permiso. Publico describe el codigo, no una aprobacion de exposicion a Internet. BL-SEC-001 y BL-SEC-002 requieren decision antes de endurecer clientes.

Recuperacion es publica para recuperar acceso: respuesta generica, cooldown y tokens hash son controles actuales; no se promete rate limiting global inexistente. Datos personales, vouchers, JWT, API keys y URLs de recuperacion no deben registrarse en logs.
