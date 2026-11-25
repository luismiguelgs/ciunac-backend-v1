# Spec: Estudiantes y Docentes

Version 1.1. Fecha: 2026-11-06. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El operador mantiene estudiantes y docentes como identidades academicas locales. Requiere API key y PostgreSQL, junto con facultad/escuela o usuario cuando el payload los relaciona.

## Flujo principal y reglas

1. Crear por DTO o consultar por UUID/documento; usar el identificador local al relacionar solicitudes y perfiles.
2. Actualizar los campos admitidos por el DTO y consultar el registro actualizado.
3. Docentes admite consultas de activos y por usuario.
4. Estudiantes se busca por numeroDocumento; codigo no representa Codigo_estudiante de Q10.
5. idQ10 es una columna nullable de 100 caracteres con indice unico parcial. No forma parte del CRUD generico; Q10Service es la fuente de escritura a traves de syncFromQ10.
6. Las relaciones academicas son facultadId/escuelaId locales. La validacion adicional de pertenencia usada por el alta Q10 se describe en [Q10](q10.md).

## Alternativas y contratos

Los contratos, parametros y tipos exactos se detallan por operacion en [historias](use-cases-index.md) y [OpenAPI](../api/openapi.json). Los CRUD que devuelven null/false o error generico al no encontrar un registro conservan ese comportamiento; no existe una politica universal de 404.

La eliminacion puede fallar por referencias existentes. La idempotencia de sincronizacion local es por documento y mismo idQ10; no equivale a reintentar un alta externa.

## Listado paginado de estudiantes

`GET /estudiantes?page=1&limit=25&search=00123&tipoEstudiante=PRE&vinculadoQ10=true` requiere la API key habitual. Por defecto devuelve la pagina 1 con hasta 25 filas. `page` y `limit` son enteros positivos y `limit` admite hasta 100. Los parametros invalidos devuelven `400`.

| Parametro opcional | Comportamiento |
| --- | --- |
| `search` | Coincidencia parcial por documento, codigo, nombres y apellidos o correo, sin distinguir mayusculas. Conserva ceros iniciales, trata `%` y `_` como caracteres literales y omite terminos vacios. |
| `tipoEstudiante` | `PRE`, `POS`, `PG` o `SIN_CLASIFICAR` (sin tipo almacenado). |
| `facultadId`, `escuelaId` | IDs positivos del catalogo local. |
| `vinculadoQ10` | `true` para ID local informado, `false` para ID nulo o en blanco. |

Los filtros se combinan y se aplican en PostgreSQL al total y a los datos. El orden es ascendente por apellidos, nombres e ID. La respuesta contiene `data` y `meta: { page, limit, total, totalPages }`, donde `total` cuenta las coincidencias. Una pagina fuera de rango devuelve `200` con `data: []` y conserva los totales. Sin coincidencias, `total` y `totalPages` son cero.

Cada fila devuelve `id`, `nombres`, `apellidos`, `tipoDocumento`, `numeroDocumento`, `codigo`, `tipoEstudiante`, `idQ10`, `facultadId`, `escuelaId` y las relaciones de catalogo `facultad` y `escuela` como `{ id, nombre }` o `null`. Para el resto de campos se utiliza el detalle por ID.

El nuevo contrato reemplaza el array anterior. Coordinar despliegue con los consumidores y actualizar su paginador para leer `data` y `meta`.

## Datos y efectos

Estudiante, Docente, Usuario, Facultad y Escuela en PostgreSQL. El CRUD local no crea automaticamente al estudiante en Q10 ni envia correo.

## Frontend y aceptacion

El frontend debe distinguir UUID, codigo y idQ10 y evitar enviar campos excluidos del DTO. CA-EST y CA-DOC verifican el contrato y seguridad de sus operaciones en la matriz; la persistencia Q10 tiene ademas pruebas de integracion.

## Fecha de nacimiento local: BL-VAL-001 corregido

- POST /estudiantes exige fechaNacimiento como texto YYYY-MM-DD, porque la columna fecha_nacimiento no admite nulos.
- PATCH /estudiantes/:id permite omitirla para conservar la existente; si se proporciona debe ser una fecha real y no admite null.
- Fechas imposibles (2001-02-29, 2000-02-30), cadenas vacias, timestamps y otros formatos producen 400 antes de persistir. 2000-02-29 es valida.
- No se convierte la entrada a Date: se conserva el dia al guardar y consultar PostgreSQL en UTC o America/Lima. No se agregan reglas de edad ni de fecha futura.
- Swagger documenta format=date y la obligatoriedad por operacion. CA-EST-001-03/04 enlazan pruebas HTTP, DTO y PostgreSQL aislado.

Ejemplo para crear SOLO en la base local, con x-api-key:

```json
{
  "nombres": "Ana",
  "apellidos": "Perez Lopez",
  "genero": "F",
  "fechaNacimiento": "2000-01-01",
  "tipoDocumento": "DNI",
  "numeroDocumento": "12345678",
  "celular": "999999999",
  "tipoEstudiante": "PG",
  "imgDoc": "https://drive.google.com/file/d/ID_DEVUELTO_POR_UPLOAD/view"
}
```

Para crear en Q10 y sincronizar localmente usar el endpoint Q10; no hacer un segundo POST /estudiantes.

## Estudiante nuevo implementado

La [feature HU-EST-002](estudiante-nuevo.md) implementa el alta con `tipoEstudiante` (`PRE`, `POS`, `PG`) e `imgDoc` opcionales y locales. La entidad mapea `tipo_estudiante` existente y el alta Q10 propaga ambos datos exclusivamente a PostgreSQL. PG admite facultad/escuela opcionales. PRE/POS con escuela exigen clasificacion compatible antes de Q10. Omitir o enviar null conserva los valores existentes; el CRUD generico admite tipo opcional y mantiene imgDoc como cadena opcional.
