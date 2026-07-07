# Implementación SDD: Actas de examen de ubicación

## Estado

**Plan técnico aprobado, pendiente de implementación.**

Este documento corresponde al punto 8 del proceso Spec-Driven Development. Implementa HU-EXU-007 y HU-EXU-008, junto con las dependencias necesarias para consolidar el acta desde PostgreSQL y almacenarla en MongoDB.

## Objetivo

Modificar `POST /actasexamenubicacion` para que reciba únicamente:

```json
{
  "examenId": 123
}
```

El backend debe obtener los datos del examen y sus participantes, validar la trazabilidad de cada solicitud y guardar una única fotografía histórica en la colección `actas_examen_ubicacion`.

## Alcance

Incluye:

- Generación del acta a partir de `examenId`.
- Consulta mediante las rutas existentes.
- Asociación del examen con un cronograma existente.
- Inclusión de `solicitudId` y `numeroVoucher` por participante.
- Unicidad, inmutabilidad, seguridad y compensación entre PostgreSQL y MongoDB.
- Compatibilidad de lectura con actas históricas.

No incluye:

- Nuevas rutas HTTP.
- Generación de PDF, firma digital o notificaciones.
- Migración de documentos MongoDB históricos.
- Implementación completa de HU-EXU-001 a HU-EXU-006.
- Archivos de migración o scripts SQL dentro del repositorio.

## Decisiones confirmadas

1. El cronograma debe existir, pero puede estar activo o inactivo.
2. El valor de `Cronogramaubicacion.activo` no bloquea la creación del examen ni la generación del acta.
3. Los exámenes existentes pueden mantener `cronogramaId=null`; en ese caso la generación del acta responde `409 EXAMEN_SIN_CRONOGRAMA`.
4. Las escrituras de actas requieren API key, JWT y permiso; las lecturas conservan API key para compatibilidad.
5. La colección MongoDB se amplía de forma aditiva, sin transformar documentos históricos.

## Rutas conservadas

| Método | Ruta | Comportamiento objetivo |
| --- | --- | --- |
| `POST` | `/actasexamenubicacion` | Genera el acta recibiendo únicamente `examenId`. |
| `GET` | `/actasexamenubicacion` | Lista actas nuevas y legadas. |
| `GET` | `/actasexamenubicacion/:id` | Consulta por ObjectId de MongoDB. |
| `PATCH` | `/actasexamenubicacion/:id` | Ruta deprecada; responde `409 ACTA_INMUTABLE`. |
| `DELETE` | `/actasexamenubicacion/:id` | Ruta deprecada; responde `409 ACTA_INMUTABLE`. |

No se crean rutas adicionales para generar, cerrar, buscar candidatos o consultar por `examenId`.

## Cambios en PostgreSQL

### Examen de ubicación

- Agregar en la entidad `Examenesubicacion`:
  - `cronogramaId: number | null` mapeado a `cronograma_id`.
  - Relación `ManyToOne` con `Cronogramaubicacion`.
- Mantener `estadoId` como la FK numérica `examenes_ubicacion.estado_id` hacia `estados.id`.
- Inyectar el repositorio de `Estado` en el servicio de actas; no se fijará directamente ningún número de estado en el código.
- `CreateExamenesubicacionDto` exigirá un entero positivo para `cronogramaId` en nuevos exámenes.
- `UpdateExamenesubicacionDto` mantendrá el campo opcional por heredar de `PartialType`.
- Las consultas del examen cargarán `cronograma` y `cronograma.modulo`.
- No se validará que `cronograma.activo` sea `true`.

### Precondición externa de base de datos

Antes de desplegar el código, un responsable de PostgreSQL debe crear:

- Columna nullable `examenes_ubicacion.cronograma_id`.
- Clave foránea hacia `cronograma_ubicacion.id`.
- Índice sobre `cronograma_id`.

También deben existir:

- Registros `CERRADO` y `ACTA_GENERADA` en la tabla `estados`, ambos con `referencia = EXAMEN_UBICACION`.
- Permiso `gestionar_examen_ubicacion` asignado a los roles administrativos correspondientes.

## Modelo MongoDB compatible

Se conservarán los campos actuales `codigo`, `fecha`, `salon`, `docente`, `idioma` y los datos descriptivos actuales de los participantes.

Se agregarán:

- `schemaVersion: 2`.
- `examenId` con índice único parcial para ignorar documentos históricos sin ese campo.
- `estadoExamen`.
- Cronograma: ID, módulo, nombre del módulo y fecha.
- Aula: ID, nombre, tipo y ubicación.
- Detalle del docente: ID, nombres y apellidos.
- Detalle del idioma: ID y nombre.
- Usuario generador: ID, email y rol obtenidos del JWT.
- Por participante:
  - `detalleId`.
  - `estudianteId`.
  - `solicitudId`.
  - `numeroVoucher`.
  - `tipoDocumento`.
  - `nivelId`.
  - `calificacionId`.
  - `cicloId`, nombre y código del ciclo.

El campo legado `ubicacion` del participante conservará como valor el nombre del ciclo obtenido.

## Flujo del servicio

1. Validar `examenId` mediante DTO con `IsInt` y `Min(1)`.
2. Buscar un acta existente por `examenId`; si existe, responder `409 ACTA_YA_EXISTE` incluyendo su `_id`.
3. Consultar el examen con estado, cronograma, módulo, aula, docente e idioma.
4. Responder `404` si el examen no existe y `409 EXAMEN_SIN_CRONOGRAMA` si no está asociado.
5. Aceptar el cronograma independientemente de su indicador `activo`.
6. Buscar `CERRADO` en `estados` con referencia `EXAMEN_UBICACION` y validar que `examen.estadoId` coincida con su ID numérico.
7. Consultar detalles activos con estudiante, nivel, calificación y ciclo.
8. Consultar todas las solicitudes involucradas en una operación por lote para evitar N+1.
9. Validar por participante:
   - `terminado=true`.
   - Nota entre 0 y 100.
   - Nivel, calificación y ciclo completos.
   - Solicitud existente, tipo 7 y estado 3 (`TERMINADO`); estado 4 (`PAGADO`) es intermedio.
   - Mismo estudiante e idioma que el detalle/examen.
   - `numeroVoucher` no vacío.
10. Construir y guardar la fotografía MongoDB ordenando participantes por apellidos y nombres.
11. Buscar `ACTA_GENERADA` en `estados` con referencia `EXAMEN_UBICACION`, obtener su ID numérico y guardarlo en `examenes_ubicacion.estado_id` junto con `modificado_en`.
12. Si falla la actualización PostgreSQL, eliminar el documento recién creado como compensación y registrar el error.
13. Si MongoDB devuelve código duplicado `11000`, responder `409 ACTA_YA_EXISTE`.

## Seguridad

- Mantener `ApiKeyGuard` a nivel del controller.
- Aplicar además `AuthGuard('jwt')`, `PermissionsGuard` y `@RequirePermissions('gestionar_examen_ubicacion')` en `POST`, `PATCH` y `DELETE`.
- `GET` mantiene únicamente API key en esta entrega.
- No registrar números de voucher, documentos completos ni tokens.
- Pasar al servicio la identidad del usuario autenticado para completar `generadoPor`.

## Errores estables

| HTTP | Código | Uso |
| --- | --- | --- |
| `400` | `VALIDACION_FALLIDA` | DTO u ObjectId inválido. |
| `404` | `EXAMEN_NO_ENCONTRADO` | El examen no existe. |
| `404` | `ACTA_NO_ENCONTRADA` | El ObjectId no corresponde a un acta. |
| `409` | `EXAMEN_SIN_CRONOGRAMA` | Examen histórico sin asociación. |
| `409` | `EXAMEN_NO_CERRADO` | Estado diferente de `CERRADO`. |
| `409` | `PARTICIPANTES_INCOMPLETOS` | Falta resultado, solicitud o voucher. |
| `409` | `ACTA_YA_EXISTE` | Ya existe un documento para `examenId`. |
| `409` | `ACTA_INMUTABLE` | Intento de edición o eliminación. |
| `500` | `CONFIGURACION_INCOMPLETA` | Falta `CERRADO` o `ACTA_GENERADA` en `estados` con referencia `EXAMEN_UBICACION`. |
| `500` | `ERROR_PERSISTENCIA_ACTA` | Fallo controlado entre MongoDB y PostgreSQL. |

## Pruebas requeridas

### Unitarias

- DTO con `examenId` válido, ausente, negativo, decimal y campos adicionales.
- Generación exitosa con cronograma activo.
- Generación exitosa con cronograma inactivo.
- Examen inexistente, sin cronograma o no cerrado.
- Resolución del ID numérico de `CERRADO` y `ACTA_GENERADA` desde la tabla `estados`.
- Examen sin participantes y cada variante de participante incompleto.
- Solicitud inexistente, tipo/estado incorrectos, idioma/estudiante distintos y voucher vacío.
- Acta preexistente y colisión MongoDB `11000`.
- Error al actualizar PostgreSQL y compensación MongoDB.
- Verificación de que el ID obtenido para `ACTA_GENERADA` se persiste en `examenes_ubicacion.estado_id`.
- ObjectId inválido, acta inexistente y lectura de documentos legados.
- `PATCH` y `DELETE` responden `ACTA_INMUTABLE`.

### Controller y seguridad

- El `POST` entrega DTO e identidad del JWT al servicio.
- Los guards de escritura son aplicados y pueden sobrescribirse en pruebas aisladas.
- Los `GET` continúan funcionando con API key.

### Verificación final

1. Ejecutar tests específicos del módulo de actas y del examen.
2. Ejecutar la suite completa con `npm run test`.
3. Ejecutar `npm run build`.
4. Ejecutar ESLint sin `--fix` sobre los archivos modificados.
5. Revisar que no se hayan creado rutas nuevas ni modificado documentos históricos.

## Criterio de finalización

La entrega queda implementada cuando el endpoint genera una única acta completa desde `examenId`, acepta cronogramas activos o inactivos, bloquea datos incompletos, conserva compatibilidad de lectura, protege escrituras y supera las pruebas definidas.
