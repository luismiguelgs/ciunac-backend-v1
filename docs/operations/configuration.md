# Configuracion Operacional

## Variables de entorno

| Variable                                        | Uso                                                 |
| ----------------------------------------------- | --------------------------------------------------- |
| `PORT`                                          | Puerto HTTP, por defecto `3000`.                    |
| `NODE_ENV`                                      | Si es `production`, Swagger UI y JSON no se montan. |
| `POSTGRES_HOST`                                 | Host PostgreSQL.                                    |
| `POSTGRES_PORT`                                 | Puerto PostgreSQL, por defecto `5432`.              |
| `POSTGRES_USER`                                 | Usuario PostgreSQL.                                 |
| `POSTGRES_PASSWORD`                             | Password PostgreSQL.                                |
| `POSTGRES_DB`                                   | Base de datos PostgreSQL.                           |
| `MONGO_URI`                                     | URI MongoDB.                                        |
| `JWT_ACCESS_SECRET`                             | Firma de access tokens.                             |
| `JWT_REFRESH_SECRET`                            | Firma de refresh tokens si se reactiva.             |
| `API_KEY`                                       | Header `x-api-key` del backend.                     |
| `EXCEPTION_ROLE`                                | Rol exceptuado en `PermissionsGuard`.               |
| `API_KEY_Q10`                                   | Credencial para Q10.                                |
| `GOOGLE_CLIENT_ID`                              | OAuth Google.                                       |
| `GOOGLE_CLIENT_SECRET`                          | OAuth Google.                                       |
| `GOOGLE_REFRESH_TOKEN`                          | Refresh token Google.                               |
| `GOOGLE_DRIVE_FOLDER_DNIS`                      | Carpeta DNI.                                        |
| `GOOGLE_DRIVE_FOLDER_VOUCHERS`                  | Carpeta vouchers.                                   |
| `GOOGLE_DRIVE_FOLDER_BECAS`                     | Carpeta becas.                                      |
| `GOOGLE_DRIVE_FOLDER_CVS`                       | Carpeta CVs.                                        |
| `GOOGLE_DRIVE_FOLDER_CONSTANCIAS`               | Carpeta constancias.                                |
| `GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO`   | Repositorio de constancias.                         |
| `ALUMNOS_EMAIL_USER` / `ALUMNOS_EMAIL_PASSWORD` | SMTP alumnos.                                       |
| `CERT_EMAIL_USER` / `CERT_EMAIL_PASSWORD`       | SMTP certificados.                                  |
| `RECAUDA_EMAIL_USER` / `RECAUDA_EMAIL_PASSWORD` | SMTP recauda.                                       |

## Comandos

| Objetivo              | Comando              |
| --------------------- | -------------------- |
| Instalar dependencias | `npm install`        |
| Desarrollo            | `npm run start:dev`  |
| Produccion            | `npm run start:prod` |
| Build                 | `npm run build`      |
| Lint con fix          | `npm run lint`       |
| Format                | `npm run format`     |
| Tests                 | `npm run test`       |

## Swagger / OpenAPI

- main.ts no define prefijo global /api/ciunac; verificar reglas del proxy si el cliente utiliza ese prefijo.

- UI local: `http://localhost:3000/api/docs`.
- JSON local: `http://localhost:3000/api/docs-json`.
- Disponible solo cuando `NODE_ENV !== "production"`.
- La seguridad documentada usa `api-key` (`x-api-key`) y `jwt` (`Authorization: Bearer <token>`).

## Checklist de arranque

- `.env` existe y contiene variables requeridas.
- PostgreSQL esta accesible.
- MongoDB esta accesible.
- `JWT_ACCESS_SECRET` y `API_KEY` no estan vacios.
- Credenciales Google Drive configuradas si se usan uploads.
- Credenciales SMTP configuradas si se usa mailer.
- Frontends esperados estan en CORS de `src/main.ts`.
- `npm run build` pasa antes de desplegar.

## Despliegue

- La aplicacion escucha en `0.0.0.0`.
- `synchronize` de TypeORM esta en `false`; los cambios de schema requieren migracion o procedimiento manual.
- Antes de desplegar la version que sincroniza estudiantes con Q10, ejecutar `docs/sql/add-id-q10-to-estudiantes.sql` en cada ambiente y comprobar que las dos consultas de verificacion devuelvan la columna y el indice.
- Registrar la ejecucion del SQL por ambiente. El backend no debe desplegarse antes del cambio de esquema.
- No exponer documentacion Swagger publica sin autenticacion o control de ambiente.

## Recuperacion, certificados y verificacion SDD

| Variable | Uso |
| --- | --- |
| PASSWORD_RESET_FRONTEND_URL | URL frontend absoluta del formulario de restablecimiento; se agrega token a query |
| PASSWORD_RESET_TOKEN_TTL_MINUTES | Caducidad positiva; default 30 minutos |
| PASSWORD_RESET_COOLDOWN_SECONDS | Espera minima positiva; default 60 segundos |
| GOOGLE_DRIVE_FOLDER_CERTIFICADOS | Carpeta de certificados originales |
| GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO | Repositorio con subcarpeta de periodo existente |

Antes de usar recuperacion, verificar tabla password_reset_tokens y SMTP ALUMNOS. Esta entrega documental no ejecuta migraciones ni SQL en bases operativas.

Comandos nuevos: api:export, api:check, docs:update, docs:check, test:contract, test:integration y sdd:check. Ejecutar con npm run. Compilar antes de exportar contratos o ejecutar pruebas sobre dist. Ver [estrategia](../testing/strategy.md).

Integracion requiere Docker y puertos libres 16543/27028; usa solo ciunac_sdd_test y TZ=UTC, nunca .env operativo. Fallos de fechas fuera de UTC estan registrados en BL-PAG-001. No cambiar zona productiva sin evaluar datos existentes.

CI publica artifacts/sdd con resultados, snapshot y diff OpenAPI. Registrar version/commit, entorno y resultado del cierre antes de desplegar. Los conteos vigentes se obtienen de traceability.json, no de cifras escritas en este procedimiento.
