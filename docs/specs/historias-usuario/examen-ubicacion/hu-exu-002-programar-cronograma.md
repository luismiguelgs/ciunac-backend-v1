# HU-EXU-002: Programar cronograma

## Historia

**Como** administrativo autorizado, **quiero** programar la fecha de un examen de ubicación para un módulo, **para** organizar previamente la convocatoria académica.

## Precondiciones

- El módulo existe.
- La fecha es válida.
- El usuario puede gestionar exámenes de ubicación.

## Criterios de aceptación

- Dado un módulo y una fecha válidos, cuando se ejecuta `POST /cronogramaubicacion`, entonces se crea el cronograma.
- Dado un módulo inexistente, cuando se intenta crear el cronograma, entonces responde `404 Not Found`.
- Dado un cronograma con exámenes asociados, cuando se intenta eliminar, entonces se rechaza con `409 Conflict` o se desactiva según su estado.
- Dado un cronograma activo o inactivo, cuando se consulta, entonces devuelve módulo, fecha, vigencia y fechas de auditoría.

## Rutas existentes

- `POST /cronogramaubicacion`
- `GET /cronogramaubicacion`
- `GET /cronogramaubicacion/:id`
- `PATCH /cronogramaubicacion/:id`
- `DELETE /cronogramaubicacion/:id`

## Reglas y dependencias

- Un examen nuevo debe referenciar un cronograma existente; su indicador `activo` no condiciona la asociación.
- La desactivación no modifica actas históricas.
- No se define una ruta especializada para publicar o cerrar cronogramas.
