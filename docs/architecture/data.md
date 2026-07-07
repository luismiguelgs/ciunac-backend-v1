# Datos y Persistencia

## Estrategia de persistencia

El backend usa dos motores:

- PostgreSQL con TypeORM para datos relacionales y transaccionales.
- MongoDB con Mongoose para documentos, actas, textos y datos con estructura flexible.

## PostgreSQL / TypeORM

Entidades actuales por dominio:

| Dominio | Entidades |
| --- | --- |
| Administrativas | `PagosBanco`, `Solicitud`, `Tipossolicitud` |
| Authentication | `Usuario`, `RolPermiso` |
| Auxiliares | `Escuela`, `Estado`, `Facultad` |
| Calificaciones | `Evaluacion`, `Nota`, `Notasfinal` |
| Estructura | `Aula`, `Ciclo`, `Grupo`, `Idioma`, `Modulo`, `Nivel` |
| Examen ubicacion | `Calificacionesubicacion`, `Cronogramaubicacion`, `Detallesubicacion`, `Examenesubicacion` |
| Principales | `Docente`, `Estudiante` |
| Seguimiento docente | `AcademicoAdministrativo`, `CumplimientoDocente`, `DashboardDocente`, `DocumentosDocente`, `EncuestaMetricasDocente`, `EncuestaPregunta`, `EncuestaRespuesta`, `EncuestaRespuestasDetalle`, `PerfilDocente`, `PerfilDocenteResultado`, `PuntajeAcademicoAdministrativo`, `TipoDocumentoPerfil` |

## MongoDB / Mongoose

Schemas actuales:

| Dominio | Schemas |
| --- | --- |
| Administrativas | `Certificado`, `Constancia`, `SolicitudBeca` |
| Auxiliares | `Texto` |
| Calificaciones | `ActaNota` |
| Examen ubicacion | `ActaExamenUbicacion` |

## Reglas para cambios de datos

- Cambios en entidades relacionales deben tener migracion o procedimiento controlado; `synchronize` esta desactivado.
- Nuevos campos deben reflejarse en DTOs, specs y pruebas.
- Relaciones TypeORM deben documentarse cuando impacten casos de uso.
- Schemas Mongoose deben incluir reglas de validacion necesarias para documentos persistidos.
- Procesos CSV deben definir columnas requeridas, validaciones y comportamiento ante filas invalidas.

## Modelo objetivo: acta de examen de ubicación

El spec de examen de ubicación mantiene PostgreSQL como fuente transaccional y MongoDB como fotografía histórica:

- `Examenesubicacion` agregará `cronogramaId` mediante migración TypeORM.
- `Detallesubicacion` conserva `solicitudId` y enlaza examen, estudiante, nota y resultado calculado.
- `Solicitud.numeroVoucher` es obligatorio para cada participante que formará parte del acta.
- `ActaExamenUbicacion` agregará `examenId` obligatorio con índice único.
- Cada participante embebido conservará `detalleId`, `solicitudId`, `numeroVoucher`, datos del estudiante, nota, nivel, ciclo y estado terminado.
- El documento se genera desde PostgreSQL; el cliente no proporciona la fotografía completa.
- Una vez publicada, el acta no se modifica ni se elimina.

La creación cruza dos motores sin transacción distribuida. Todas las validaciones se ejecutan antes de insertar en MongoDB. Si la inserción termina pero falla el cambio del examen a `ACTA_GENERADA`, el servicio debe compensar eliminando únicamente el documento todavía no publicado y registrar el error.

Véase [Spec SDD: Exámenes de ubicación](../specs/examen-ubicacion.md).
