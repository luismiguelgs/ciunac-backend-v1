# HU-EXU-001: Configurar rangos de ubicación

## Historia

**Como** administrativo autorizado, **quiero** configurar rangos de notas por idioma, nivel y ciclo, **para** que el sistema determine de forma uniforme la ubicación obtenida por cada participante.

## Precondiciones

- Existen idioma, nivel y ciclo válidos.
- El usuario puede gestionar exámenes de ubicación.
- La escala válida es de 0 a 100.

## Criterios de aceptación

- Dado un rango válido, cuando se registra mediante `POST /calificacionesubicacion`, entonces queda disponible para clasificar notas.
- Dado un rango cuyo mínimo supera al máximo, cuando se intenta guardar, entonces responde `400 Bad Request`.
- Dados dos rangos del mismo idioma que se solapan, cuando se crea o actualiza el segundo, entonces responde `409 Conflict`.
- Dada una nota entre 0 y 100, cuando se calcula la ubicación, entonces coincide con un único rango.
- Dado un rango inexistente, cuando se consulta `GET /calificacionesubicacion/:id`, entonces responde `404 Not Found`.

## Rutas existentes

- `POST /calificacionesubicacion`
- `GET /calificacionesubicacion`
- `GET /calificacionesubicacion/:id`
- `PATCH /calificacionesubicacion/:id`
- `DELETE /calificacionesubicacion/:id`

## Reglas y dependencias

- Se relaciona con `Idioma`, `Nivel` y `Ciclo`.
- La eliminación no debe dejar un examen en curso sin una regla capaz de clasificar sus notas.
- No se crean rutas adicionales ni se calcula la ubicación en el frontend.

