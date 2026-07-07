# HU-EXU-003: Crear examen de ubicación

## Historia

**Como** administrativo autorizado, **quiero** crear un examen asociado a un cronograma, docente, aula e idioma, **para** disponer de una sesión evaluativa identificable y controlada.

## Precondiciones

- El cronograma existe; puede estar activo o inactivo.
- El docente, aula, idioma y estado existen.
- El código del examen no está registrado.

## Criterios de aceptación

- Dados datos válidos, cuando se ejecuta `POST /examenesubicacion`, entonces se crea el examen en estado `PROGRAMADO`.
- La fecha del examen debe coincidir con el mismo día calendario del cronograma asociado.
- Dado un código repetido, cuando se intenta crear, entonces responde `409 Conflict`.
- Dado un cronograma inexistente, cuando se intenta crear, entonces responde `404 Not Found`.
- Dado un cronograma inactivo existente, cuando se crea el examen, entonces la asociación es válida.
- Dado un examen existente, cuando se consulta, entonces devuelve cronograma, estado, idioma, docente y aula.
- Dada una transición no permitida, cuando se usa `PATCH /examenesubicacion/:id`, entonces responde `409 Conflict`.

## Rutas existentes

- `POST /examenesubicacion`
- `GET /examenesubicacion`
- `GET /examenesubicacion/:id`
- `PATCH /examenesubicacion/:id`
- `DELETE /examenesubicacion/:id`

## Reglas y dependencias

- El contrato objetivo agrega `cronogramaId` al DTO de creación y a la entidad.
- Los estados válidos son `PROGRAMADO`, `EN_CURSO`, `CERRADO`, `ACTA_GENERADA` y `CANCELADO`.
- Un examen con acta no puede modificarse ni eliminarse.
