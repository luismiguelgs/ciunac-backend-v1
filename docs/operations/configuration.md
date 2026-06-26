# Configuracion Operacional

## Variables de entorno

| Variable | Uso |
| --- | --- |
| `PORT` | Puerto HTTP, por defecto `3000`. |
| `NODE_ENV` | Si es `production`, Swagger UI y JSON no se montan. |
| `POSTGRES_HOST` | Host PostgreSQL. |
| `POSTGRES_PORT` | Puerto PostgreSQL, por defecto `5432`. |
| `POSTGRES_USER` | Usuario PostgreSQL. |
| `POSTGRES_PASSWORD` | Password PostgreSQL. |
| `POSTGRES_DB` | Base de datos PostgreSQL. |
| `MONGO_URI` | URI MongoDB. |
| `JWT_ACCESS_SECRET` | Firma de access tokens. |
| `JWT_REFRESH_SECRET` | Firma de refresh tokens si se reactiva. |
| `API_KEY` | Header `x-api-key` del backend. |
| `EXCEPTION_ROLE` | Rol exceptuado en `PermissionsGuard`. |
| `API_KEY_Q10` | Credencial para Q10. |
| `GOOGLE_CLIENT_ID` | OAuth Google. |
| `GOOGLE_CLIENT_SECRET` | OAuth Google. |
| `GOOGLE_REFRESH_TOKEN` | Refresh token Google. |
| `GOOGLE_DRIVE_FOLDER_DNIS` | Carpeta DNI. |
| `GOOGLE_DRIVE_FOLDER_VOUCHERS` | Carpeta vouchers. |
| `GOOGLE_DRIVE_FOLDER_BECAS` | Carpeta becas. |
| `GOOGLE_DRIVE_FOLDER_CVS` | Carpeta CVs. |
| `GOOGLE_DRIVE_FOLDER_CONSTANCIAS` | Carpeta constancias. |
| `GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO` | Repositorio de constancias. |
| `ALUMNOS_EMAIL_USER` / `ALUMNOS_EMAIL_PASSWORD` | SMTP alumnos. |
| `CERT_EMAIL_USER` / `CERT_EMAIL_PASSWORD` | SMTP certificados. |
| `RECAUDA_EMAIL_USER` / `RECAUDA_EMAIL_PASSWORD` | SMTP recauda. |

## Comandos

| Objetivo | Comando |
| --- | --- |
| Instalar dependencias | `npm install` |
| Desarrollo | `npm run start:dev` |
| Produccion | `npm run start:prod` |
| Build | `npm run build` |
| Lint con fix | `npm run lint` |
| Format | `npm run format` |
| Tests | `npm run test` |

## Swagger / OpenAPI

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
- No exponer documentacion Swagger publica sin autenticacion o control de ambiente.
