# Spec: Seguimiento Docente

## Objetivo funcional

Evaluar y monitorear informacion profesional, documental, academica, administrativa y estudiantil de docentes.

## Actores

- Administrador academico.
- Docente.
- Area de seguimiento docente.
- Frontend dashboard.

## Precondiciones

- Docentes registrados.
- Modulo activo cuando los dashboards o resultados lo requieran.
- Preguntas, respuestas y metricas configuradas.
- API key y/o guards definidos para endpoints sensibles.

## Flujo principal

1. Se crea o actualiza perfil docente.
2. Se registran documentos asociados al perfil.
3. Se configuran preguntas, puntajes y cumplimiento.
4. Se cargan respuestas de encuesta por CSV.
5. Se generan metricas y resultados de perfil docente.
6. El dashboard consulta indicadores globales, ranking y dimensiones.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| No existe modulo activo | `404 Not Found` en servicios de dashboard/resultados. |
| CSV de encuesta no enviado | `400 Bad Request`. |
| CSV de encuesta no valido | `400 Bad Request`. |
| Perfil docente inexistente | `404 Not Found`. |
| Endpoint sin guard visible | Debe revisarse antes de exponer produccion. |

## Reglas de negocio

- `perfil-docente-resultados/generar` calcula resultados combinando perfil, metricas, cumplimiento y encuesta.
- `dashboard-docentes` expone vistas agregadas: metricas globales, desempeno, ranking, perfil profesional, cumplimiento, gestion metodologica y valoracion estudiantil.
- `encuesta-respuestas/upload` procesa CSVs de respuestas.
- Documentos docente se consultan por `perfilDocenteId`.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/perfil-docente` | ApiKey | `CreatePerfilDocenteDto` | Perfil creado |
| `POST` | `/documentos-docente` | ApiKey | `CreateDocumentosDocenteDto` | Documento creado |
| `GET` | `/documentos-docente/perfil/:perfilDocenteId` | ApiKey | Perfil id | Documentos del perfil |
| `POST` | `/encuesta-respuestas/upload` | ApiKey | CSV multipart | Resultado de carga |
| `GET` | `/encuesta-respuestas/buscar` | ApiKey | Query docente/modulo | Respuestas filtradas |
| `POST` | `/perfil-docente-resultados/generar` | Sin guard visible | Payload de generacion | Resultado generado |
| `GET` | `/perfil-docente-resultados/detalle/:moduloId/:docenteId` | Sin guard visible | Modulo y docente | Detalle de evaluacion |
| `GET` | `/dashboard-docentes/metricas-globales` | Sin guard visible | Query opcional | Metricas globales |

## Datos involucrados

- Entidades: `PerfilDocente`, `DocumentosDocente`, `TipoDocumentoPerfil`, `AcademicoAdministrativo`, `PuntajeAcademicoAdministrativo`, `CumplimientoDocente`, `EncuestaPregunta`, `EncuestaRespuesta`, `EncuestaRespuestasDetalle`, `EncuestaMetricasDocente`, `PerfilDocenteResultado`, `Docente`, `Modulo`.

## Integraciones externas

- Entrada CSV para respuestas de encuesta.
- Google Drive puede participar en documentos si se usa flujo de upload compartido.

## Criterios de aceptacion

- Dado un docente con perfil, cuando se registran documentos, entonces pueden consultarse por perfil.
- Dado un CSV valido, cuando se carga encuesta, entonces se persisten respuestas.
- Dado un modulo activo, cuando se consulta dashboard, entonces devuelve indicadores agregados.
- Dado que no hay modulo activo, cuando se consulta dashboard, entonces se responde `404`.
- Dado un docente y modulo validos, cuando se genera resultado, entonces queda disponible el detalle.

## Casos de prueba sugeridos

- Unit: calculo de resultados, busquedas por periodo/modulo, errores de modulo activo.
- Integration: perfil -> documentos -> resultados.
- E2E: carga CSV -> busqueda -> dashboard.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controllers | Controllers bajo `src/modules/seguimiento_docente` |
| Services | Services bajo `src/modules/seguimiento_docente` |
| Riesgo | Revisar guards faltantes antes de publicar endpoints sensibles |
