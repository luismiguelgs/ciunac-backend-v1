# Indice de Casos de Uso

| Spec | Dominio | Endpoints clave | Servicios clave | Estado |
| --- | --- | --- | --- | --- |
| [Authentication](authentication.md) | Authentication | `/auth`, `/usuarios`, `/rol-permisos` | `AuthService`, `UsuariosService`, `RolPermisosService` | Inicial |
| [Solicitudes administrativas](solicitudes-administrativas.md) | Administrativas | `/solicitudes`, `/constancias`, `/certificados`, `/solicitudbecas` | `SolicitudesService`, `ConstanciasService`, `CertificadosService`, `SolicitudbecasService` | Inicial |
| [Rechazo de solicitud](rechazo-solicitud.md) | Administrativas | `PATCH /solicitudes/:id/rechazo`; `DELETE /solicitudes/:id` legado | `SolicitudesService`, `MailerService` | Implementado |
| [Pagos banco](pagos-banco.md) | Administrativas | `/pagos-banco/upload`, `/pagos-banco/reverify` | `PagosBancoService` | Inicial |
| [Examen ubicacion](examen-ubicacion.md) | Examen ubicacion | `/examenesubicacion`, `/detallesubicacion`, `/calificacionesubicacion`, `/cronogramaubicacion`, `/actasexamenubicacion` | Servicios de examen ubicacion | Inicial |
| [Seguimiento docente](seguimiento-docente.md) | Seguimiento docente | `/perfil-docente`, `/encuesta-respuestas`, `/perfil-docente-resultados`, `/dashboard-docentes` | Servicios de seguimiento docente | Inicial |
| [Q10](q10.md) | Integracion | `/q10/estudiantes`, `/q10/horarios-cursos` | `Q10Service` | Inicial |
| [Uploads y mailer](uploads-mailer.md) | Shared | `/upload/:folder`, `/mailer` | `UploadService`, `MailerService` | Inicial |

## Trazabilidad requerida

Cada spec debe mantenerse conectada con:

- Endpoint HTTP.
- Controller y service.
- DTO de entrada.
- Entidad o schema persistido.
- Criterios de aceptacion.
- Pruebas unitarias, integracion o e2e.

## Priorizacion recomendada

1. Autenticacion y permisos.
2. Solicitudes administrativas y pagos banco.
3. Seguimiento docente.
4. Examen ubicacion.
5. Q10, uploads y mailer.
6. CRUDs de estructura, auxiliares, calificaciones y principales.
