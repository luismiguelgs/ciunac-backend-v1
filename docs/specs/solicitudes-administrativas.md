# Spec: Solicitudes Administrativas

> El rechazo de solicitudes se documenta en detalle en [Rechazo de solicitud](rechazo-solicitud.md).

## Objetivo funcional

Gestionar solicitudes administrativas y documentos derivados: constancias, certificados y becas.

## Actores

- Estudiante o solicitante.
- Administrador administrativo.
- Sistema de correo para notificaciones.

## Precondiciones

- Tipos de solicitud configurados.
- Estados validos configurados.
- API key valida para endpoints.
- MongoDB disponible para documentos Mongoose cuando aplique.

## Flujo principal

1. El frontend crea una solicitud en `POST /solicitudes`.
2. El administrador consulta solicitudes por tipo, estado, documento o fechas.
3. El sistema crea o actualiza constancias, certificados o becas relacionadas.
4. El administrador marca estados de procesamiento.
5. El sistema permite consultar documentos pendientes, impresos o aceptados.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| Estado faltante en consultas por estado | `400 Bad Request`. |
| Tipo invalido en reporte por fechas | `400 Bad Request`. |
| Documento inexistente | Lista vacia o error segun endpoint. |
| Documento no encontrado para actualizar | Error controlado del service. |

## Reglas de negocio

- `solicitudes/certificados`, `solicitudes/constancias` y `solicitudes/examenes-ubicacion` filtran solicitudes por estado.
- `constancias/procesar-firma` representa una transicion operacional especifica.
- Certificados y constancias se guardan como documentos MongoDB.
- Solicitudes principales se guardan como entidad relacional.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/solicitudes` | ApiKey | `CreateSolicitudDto` | Solicitud creada |
| `PATCH` | `/solicitudes/:id/rechazo` | ApiKey | `RejectSolicitudDto` | Solicitud rechazada y estado de notificacion |
| `GET` | `/solicitudes` | ApiKey | Query opcional | Lista de solicitudes |
| `GET` | `/solicitudes/documento/:numeroDocumento` | ApiKey | Numero documento | Solicitudes del documento |
| `GET` | `/solicitudes/reporte-fechas` | ApiKey | `inicio`, `fin`, `tipo` | Reporte filtrado |
| `POST` | `/constancias` | ApiKey | `CreateConstanciaDto` | Constancia creada |
| `PATCH` | `/constancias/procesar-firma` | ApiKey | Payload de firma | Constancia procesada |
| `POST` | `/certificados` | ApiKey | `CreateCertificadoDto` | Certificado creado |
| `POST` | `/solicitudbecas` | ApiKey | `CreateSolicitudbecaDto` | Solicitud de beca creada |

## Datos involucrados

- Entidades: `Solicitud`, `Tipossolicitud`, `Estado`.
- Schemas: `Constancia`, `Certificado`, `SolicitudBeca`.
- DTOs: `CreateSolicitudDto`, `UpdateSolicitudDto`, `CreateConstanciaDto`, `CreateCertificadoDto`, `CreateSolicitudbecaDto`.

## Integraciones externas

- Mailer para notificaciones cuando el flujo lo requiera.
- Upload/Google Drive para archivos asociados a documentos.

## Criterios de aceptacion

- Dado un payload valido, cuando se crea solicitud, entonces queda persistida.
- Dado un estado valido, cuando se consultan constancias pendientes, entonces se devuelven solo registros aplicables.
- Dado un rango de fechas valido, cuando se solicita reporte, entonces se filtra por fecha y tipo.
- Dado un tipo de reporte invalido, entonces se rechaza con `400`.

## Casos de prueba sugeridos

- Unit: filtros por estado y fecha en `SolicitudesService`.
- Integration: creacion de solicitud y documento derivado.
- E2E: solicitud -> constancia/certificado -> consulta por estado.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controllers | `solicitudes.controller.ts`, `constancias.controller.ts`, `certificados.controller.ts`, `solicitudbecas.controller.ts` |
| Services | `SolicitudesService`, `ConstanciasService`, `CertificadosService`, `SolicitudbecasService` |
| Data | `Solicitud`, `Constancia`, `Certificado`, `SolicitudBeca` |
