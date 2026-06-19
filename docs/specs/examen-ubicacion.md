# Spec: Examen Ubicacion

## Objetivo funcional

Gestionar el ciclo de examen de ubicacion: cronograma, examen, detalle de participantes, calificaciones y actas.

## Actores

- Administrador academico.
- Estudiante postulante o evaluado.
- Frontend administrativo.

## Precondiciones

- API key valida.
- Estudiantes y estructura academica disponibles cuando el flujo los requiera.
- PostgreSQL disponible para datos transaccionales.
- MongoDB disponible para actas.

## Flujo principal

1. El administrador crea un cronograma de ubicacion.
2. Se crea o consulta un examen de ubicacion.
3. Se registran detalles del examen por estudiante.
4. Se registran calificaciones.
5. Se genera o consulta acta de examen.
6. El administrador consulta detalles por examen o por documento de estudiante.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| Examen inexistente | Error controlado o lista vacia segun endpoint. |
| Documento sin detalle | Lista vacia o no encontrado. |
| Acta no encontrada | Error controlado Mongoose. |
| Payload invalido | `400 Bad Request` por ValidationPipe. |

## Reglas de negocio

- `detallesubicacion/examen/:id` agrupa participantes o detalles por examen.
- `detallesubicacion/estudiante/documento/:documentNumber` permite busqueda operacional por documento.
- Actas de examen usan MongoDB por naturaleza documental.
- Calificaciones, examenes, detalles y cronograma usan PostgreSQL.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/cronogramaubicacion` | ApiKey | `CreateCronogramaubicacionDto` | Cronograma creado |
| `POST` | `/examenesubicacion` | ApiKey | `CreateExamenesubicacionDto` | Examen creado |
| `POST` | `/detallesubicacion` | ApiKey | `CreateDetallesubicacionDto` | Detalle creado |
| `GET` | `/detallesubicacion/examen/:id` | ApiKey | Id examen | Detalles del examen |
| `GET` | `/detallesubicacion/estudiante/documento/:documentNumber` | ApiKey | Documento | Detalles por estudiante |
| `POST` | `/calificacionesubicacion` | ApiKey | `CreateCalificacionesubicacionDto` | Calificacion creada |
| `POST` | `/actasexamenubicacion` | ApiKey | `CreateActasexamenubicacionDto` | Acta creada |

## Datos involucrados

- Entidades: `Cronogramaubicacion`, `Examenesubicacion`, `Detallesubicacion`, `Calificacionesubicacion`.
- Schema: `ActaExamenUbicacion`.

## Integraciones externas

- No se observa integracion externa directa en este dominio.

## Criterios de aceptacion

- Dado un cronograma valido, cuando se crea, entonces queda disponible para consulta.
- Dado un examen con detalles, cuando se consulta por examen, entonces devuelve participantes relacionados.
- Dado un documento registrado, cuando se consulta por documento, entonces devuelve sus detalles.
- Dado una calificacion valida, cuando se registra, entonces queda asociada al proceso de ubicacion.

## Casos de prueba sugeridos

- Unit: services CRUD y busquedas especificas.
- Integration: examen -> detalle -> calificacion.
- E2E: consulta por documento y por examen.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controllers | Controllers bajo `src/modules/examen_ubicacion` |
| Services | Services bajo `src/modules/examen_ubicacion` |
| Data | Entidades de ubicacion y `ActaExamenUbicacion` |
