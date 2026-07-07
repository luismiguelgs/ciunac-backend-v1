# HU-EXU-004: Incorporar participantes

## Historia

**Como** administrativo autorizado, **quiero** consultar solicitudes terminadas e incorporar cada alumno al examen correspondiente, **para** mantener la relación entre participante, solicitud y pago verificado.

## Precondiciones

- El examen está `PROGRAMADO` o `EN_CURSO`.
- La solicitud pertenece al tipo examen de ubicación (`tipoSolicitudId=7`).
- La solicitud tiene pago verificado y flujo terminado (`estadoId=3`) y voucher.

## Criterios de aceptación

- Dado `estado=3`, cuando se consulta `GET /solicitudes/examenes-ubicacion`, entonces se obtienen las solicitudes candidatas existentes.
- Dada una solicitud elegible del mismo idioma, cuando se ejecuta `POST /detallesubicacion`, entonces se incorpora un participante.
- Dada una solicitud sin voucher, de otro idioma o ya asignada a otro examen activo, cuando se intenta incorporar, entonces responde `409 Conflict`.
- Dado un examen, cuando se consulta `GET /detallesubicacion/examen/:id`, entonces devuelve sus participantes activos ordenados por apellidos.
- Si una incorporación falla, las incorporaciones anteriores no se alteran; el flujo es individual, no masivo.

## Rutas existentes

- `GET /solicitudes/examenes-ubicacion?estado=3`
- `POST /detallesubicacion`
- `GET /detallesubicacion`
- `GET /detallesubicacion/examen/:id`
- `GET /detallesubicacion/estudiante/documento/:documentNumber`
- `GET /detallesubicacion/:id`
- `DELETE /detallesubicacion/:id`

## Reglas y dependencias

- El detalle conserva `solicitudId`, `estudianteId`, `examenId` e `idiomaId`.
- La eliminación actual es lógica mediante `activo=false`.
- No se introduce una ruta de candidatos ni una ruta de asignación masiva.
