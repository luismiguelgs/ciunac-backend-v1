# HU-EXU-005: Registrar notas y calcular ubicación

## Historia

**Como** administrativo autorizado, **quiero** registrar la nota obtenida por cada participante, **para** que el backend determine automáticamente su nivel y ciclo de ubicación.

## Precondiciones

- El detalle está activo y pertenece a un examen `EN_CURSO`.
- Existen rangos válidos para el idioma del examen.
- La nota utiliza la escala de 0 a 100.

## Criterios de aceptación

- Dada una nota válida, cuando se ejecuta `PATCH /detallesubicacion/:id`, entonces el backend asigna exactamente una calificación, nivel y ciclo.
- Dada una nota fuera de la escala, cuando se envía, entonces responde `400 Bad Request`.
- Dada una nota sin rango o con más de un rango coincidente, cuando se procesa, entonces responde `409 Conflict` sin modificar el detalle.
- El cliente no puede imponer `calificacionId`, `nivelId` ni ciclo en el flujo objetivo.
- Cuando el resultado queda completo, el detalle conserva `nota`, resultado calculado y `terminado=true`.

## Rutas existentes

- `PATCH /detallesubicacion/:id`
- `GET /detallesubicacion/:id`
- `GET /detallesubicacion/examen/:id`

## Reglas y dependencias

- La operación usa `Calificacionesubicacion` como fuente de rangos.
- La modificación debe ser atómica en PostgreSQL.
- El resultado se registra mediante la ruta de detalle existente y no se calcula en el frontend.
