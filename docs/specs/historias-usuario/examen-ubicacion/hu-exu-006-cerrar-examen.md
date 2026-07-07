# HU-EXU-006: Cerrar examen

## Historia

**Como** administrativo autorizado, **quiero** cerrar un examen cuando todos sus participantes estén procesados, **para** impedir resultados incompletos antes de generar el acta.

## Precondiciones

- El examen está `EN_CURSO`.
- Existe al menos un participante activo.
- Cada participante tiene nota, resultado, solicitud, voucher y `terminado=true`.

## Criterios de aceptación

- Dado un examen completo, cuando se actualiza mediante `PATCH /examenesubicacion/:id`, entonces cambia a `CERRADO`.
- Dado un participante incompleto, cuando se intenta cerrar, entonces responde `409 Conflict` e identifica el detalle afectado.
- Dado un examen sin participantes, cuando se intenta cerrar, entonces responde `409 Conflict`.
- Dado un examen cerrado, cuando se intenta volver a `EN_CURSO`, entonces se rechaza la transición.
- El cierre no genera automáticamente el acta; la generación sigue siendo una acción explícita en la ruta de actas.

## Rutas existentes

- `GET /detallesubicacion/examen/:id`
- `GET /examenesubicacion/:id`
- `PATCH /examenesubicacion/:id`

## Reglas y dependencias

- Los estados se resuelven desde el catálogo con referencia `EXAMEN_UBICACION`.
- El cierre utiliza la actualización existente del examen.
- Un examen `CERRADO` solo puede avanzar a `ACTA_GENERADA`.
