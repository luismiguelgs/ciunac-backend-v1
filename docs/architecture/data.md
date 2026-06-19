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
