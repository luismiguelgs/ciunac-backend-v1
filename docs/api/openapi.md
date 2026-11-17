# Swagger / OpenAPI

## Contrato reproducible

- UI: /api/docs; JSON vivo: /api/docs-json; solo fuera de produccion.
- No hay prefijo global /api/ciunac en main.ts; verificar el proxy del despliegue.
- [Snapshot versionado](openapi.json), [inventario](endpoints.md), [matriz SDD](../specs/traceability.json).
- Generar: npm run build y npm run api:export. Sin .env ni conexiones externas; controllers compilados y proveedores simulados.
- Verificar: npm run api:check. Compara snapshot, rutas, metodos, operationId, guards, bodies y multipart.
- npm run docs:update regenera inventario, modulos, historias y matriz desde codigo y flows.json.

## Metadata

src/config/swagger.config.ts usa el plugin Nest. openapi-metadata.ts completa seguridad, tags, parametros y contratos inline. openapi-contracts.ts concreta respuestas genericas de TypeScript. Sufijos: .dto.ts, .entity.ts y .schema.ts. No se cambian validaciones de ejecucion para hacer coincidir Swagger.

API key y JWT en el mismo requisito significan AND; endpoints publicos llevan security vacio. Permisos enumerados en inventario y comprobados por guards reales.

Multipart: upload, pagos, encuestas y POST /certificados/{id}/archivo (file PDF, fileId opcional). Generacion docente documenta body moduloId/docenteId, sin introducir validaciones nuevas.

## Respuestas reales

Archivos/firma, resumen CSV, detalle/dashboard, reportes y Q10 tienen schemas concretos. Decimales SQL sin transformador son texto; dates SQL son fechas, timestamps ISO. Relaciones son opcionales cuando no se cargan.

GET nullable conserva el 200 del controlador; si el servicio devuelve null, Nest responde sin cuerpo y no necesariamente con JSON null. El cliente no debe llamar response.json() incondicionalmente. No se inventa 404. Borrados void no documentan objetos ficticios. PATCH/DELETE actas documentan 409, ademas de errores de seguridad.

Las pruebas con servicios simulados no sustituyen [integracion](../testing/strategy.md). Limitaciones observadas en [backlog](../specs/backlog.md).

## Mantenimiento

### Alumno nuevo: correccion 2026-11-06

Swagger refleja los cinco campos Q10 opcionales y tipoEstudiante nullable (null incluido en el enum). El upload solo exige file y expone viewLink/downloadLink para enviarlo como imgDoc, sin vincular automaticamente al alumno. El 502 Q10 documenta Q10_UNAVAILABLE y los tres errores posteriores al alta, con message y retryAllowed.

En POST /estudiantes fechaNacimiento es obligatoria, real y de formato date (YYYY-MM-DD); en PATCH es opcional, pero no nullable. La entrada no se convierte implicitamente a Date. Pruebas comparan requests minimos/nulos, ejemplos completos y errores 502 con sus schemas, ademas de persistencia real aislada en UTC/America-Lima. Ver [feature](../specs/estudiante-nuevo.md) y [principales](../specs/principales.md).

No editar JSON generado a mano. Actualizar DTO/decorador de documentacion, compilar, exportar, regenerar y verificar. Operaciones nuevas requieren flow; las eliminadas deben desaparecer de inventario y matriz. CI publica el diff.
