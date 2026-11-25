# Feature: Estudiante nuevo, clasificacion y documento de identidad

## Identificacion y alcance

- Historia: **HU-EST-002**. Caso: **CU-EST-002**. Version: 1.2. Fecha: 2026-11-06.
- Estado: **Backend implementado**; las pruebas ejecutadas se acreditan en el reporte SDD, no por esta etiqueta documental.
- Extiende [HU-Q10-002](historias-usuario/q10/hu-q10-002-registrar-estudiante-q10-y-local.md), el catalogo [HU-ESC-001](historias-usuario/auxiliares/hu-esc-001-gestionar-escuelas.md) y las consultas de estudiantes.

El alta recibe opcionalmente `tipoEstudiante`, `codigo` e `imgDoc`. Se guardan exclusivamente en la tabla local `estudiantes`, en `tipo_estudiante`, `codigo` e `img_doc`. La pantalla frontend y las politicas nuevas de upload no forman parte de esta implementacion.

## Reglas de negocio

| Requisito     | Comportamiento                                                                                                                                                                        |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RF-EST-002-01 | `tipoEstudiante` es opcional y admite `PRE`, `POS` o `PG`. No tiene valor predeterminado.                                                                                             |
| RF-EST-002-02 | `PG` significa publico en general. Facultades y escuelas siguen siendo opcionales; si se envian, se aceptan y se valida su existencia y pertenencia, sin exigir coincidencia de tipo. |
| RF-EST-002-03 | Una escuela nueva requiere `tipo: PRE` o `POS`. Las historicas pueden conservar `null` hasta clasificarse; `PG` no es tipo de escuela.                                                |
| RF-EST-002-04 | Para PRE/POS con escuela seleccionada, esta debe estar clasificada y tener el mismo tipo, aunque no se envie facultad.                                                                |
| RF-EST-002-05 | `imgDoc` es opcional. Si se envia en el alta Q10 debe ser una URL absoluta HTTP/HTTPS no vacia; se recomienda usar `viewLink` del upload DNIS.                                        |
| RF-EST-002-06 | `tipoEstudiante`, `codigo`, `imgDoc`, `facultadId` y `escuelaId` se excluyen de todas las peticiones Q10.                                                                             |
| RF-EST-002-07 | El exito exige sincronizacion local e inscripcion en el programa Q10. No se exige tipo ni documento cuando se omiten.                                                                 |
| RF-EST-002-08 | `codigo` admite texto de 1 a 50 caracteres tras recortar espacios y conserva los ceros iniciales. La clave de imagen es `imgDoc`; `img_doc` se rechaza en JSON. |

Omitir los campos locales o enviar `null` conserva sus valores existentes al sincronizar; en un registro nuevo quedan sin valor. No hay borrado implicito ni inferencia de tipo desde la escuela. Para validar un estudiante existente se usa el tipo y las relaciones efectivas (valor nuevo no nulo, o persistido). Si no existe tipo efectivo, se mantienen las validaciones de existencia y pertenencia sin exigir clasificacion.

Un cambio de tipo de escuela devuelve `400` si existen estudiantes vinculados PRE/POS incompatibles. Los PG y los estudiantes sin clasificacion no bloquean el cambio.

## Flujo y contratos

1. El frontend recoge los datos personales y puede incluir tipo y documento.
2. Si se adjunta documento, carga primero `POST /upload/DNIS`, multipart `file` y `nombre` opcional. Conserva el `viewLink` de una respuesta con `success: true`.
3. Envia el JSON a `POST /q10/estudiantes`, incluyendo los campos locales que correspondan. No realiza otro `POST /estudiantes`.
4. El backend valida el DTO y los catalogos efectivos antes de contactar a Q10.
5. Crea en Q10 con sus campos actuales, valida `Codigo_estudiante` y sincroniza por documento, guardando juntos `id_q10`, tipo, codigo, documento y relaciones proporcionadas.
6. Confirma la matricula del programa. Responde `201` con `status`, `estudiante: { id, idQ10, numeroDocumento }` y `programaRegistrado`.
7. `GET /estudiantes/:id` permite consultar `tipoEstudiante`, `codigo` e `imgDoc` persistidos.

Todos los endpoints anteriores mantienen `x-api-key`. El registro sigue siendo JSON; el binario, si existe, se carga por separado.

### Contratos Swagger y alternativa de alta local

- El upload exige `file`; `nombre` y `fileId` son opcionales. Devuelve `viewLink` y `downloadLink`, no un campo `url`. Verificar que `viewLink` no este vacio antes de usarlo como `imgDoc`. La carga no actualiza al estudiante por si sola.
- `tipoEstudiante` permite `PRE`/`POS`/`PG` o `null` en los schemas de Q10, POST local y PATCH local. `null` conserva la clasificacion existente, no la borra.
- En Q10, `Direccion`, `Lugar_nacimiento`, `Lugar_residencia`, `Consecutivo_sedejornada` y `Consecutivo_periodo` son opcionales; el backend establece los valores remotos actuales. No pedirlos como campos obligatorios en frontend.
- `POST /estudiantes` es una alternativa SOLO local, sin Q10; requiere `fechaNacimiento` como fecha real `YYYY-MM-DD`. `PATCH /estudiantes/:id` permite omitir `fechaNacimiento`, pero no acepta `null`, fechas imposibles ni timestamps. Se conserva el dia sin conversion a `Date` en esos endpoints.
- El alta Q10 sigue usando el campo `Fecha_nacimiento` y su contrato existente; no confundir los nombres de ambos DTOs.
- La respuesta Q10 `201` conserva UUID local, `idQ10` y `numeroDocumento`; tipo, documento e IDs academicos se consultan con `GET /estudiantes/:id`. No se agregan campos de respuesta ficticios.
- El schema `502` incluye `Q10_PERIOD_LOOKUP_FAILED`, `Q10_UNAVAILABLE` y los tres codigos `Q10_CREATED_*`, todos con `retryAllowed=false`. Los errores incluyen `message`, operacion y etapa. Ver [contrato de errores y logs](../frontend/q10-registration-errors.md). Un fallo de comunicacion puede ser ambiguo: nunca repetir automaticamente un alta sin revisar el estado remoto.

```json
{
  "Primer_nombre": "Ana",
  "Primer_apellido": "Perez",
  "Segundo_apellido": "Lopez",
  "Email": "ana@example.com",
  "Codigo_tipo_identificacion": "PE01",
  "Numero_identificacion": "12345678",
  "Genero": "F",
  "Fecha_nacimiento": "2000-01-01",
  "Telefono": "014444444",
  "Celular": "999999999",
  "Codigo_programa": "INGLES",
  "tipoEstudiante": "PG",
  "codigo": "0012345678",
  "imgDoc": "https://drive.google.com/file/d/ID_DEVUELTO_POR_UPLOAD/view",
  "facultadId": 3,
  "escuelaId": 8
}
```

Los cinco ultimos campos pueden omitirse individualmente. Los IDs son ejemplos del catalogo local. Para PRE/POS, una escuela enviada debe tener el mismo tipo del estudiante.

| Operacion                                                                  | Cambio                                                                                            |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `POST /q10/estudiantes`                                                    | Acepta tipo, codigo y documento opcionales; `null` conserva valores previos.                      |
| `POST /estudiantes`, `PATCH /estudiantes/:id`                              | Admiten y validan tipo opcional. Conservan la validacion generica actual de `imgDoc` como cadena. |
| `GET /estudiantes` | [Listado paginado](principales.md#listado-paginado-de-estudiantes) con los campos de tabla. |
| `GET /estudiantes/:id`, `GET /estudiantes/buscar/:dni` | Exponen los campos locales persistidos. |
| `POST /escuelas`                                                           | Requiere `tipo` con valor `PRE` o `POS`.                                                          |
| `PATCH /escuelas/:id`                                                      | Tipo opcional, pero `null`/`PG` se rechazan; protege alumnos vinculados incompatibles.            |
| `GET /escuelas`, `GET /escuelas/:id`                                       | Exponen `tipo`, nullable para historicos.                                                         |

## Errores y efectos parciales

| Situacion                                                                | Respuesta                                                                                                  |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Tipo fuera de PRE/POS/PG, codigo invalido, URL documental invalida o clave `img_doc` | `400` antes de contactar a Q10.                                                                  |
| PRE/POS con escuela sin clasificar                                       | `400`: `La escuela indicada debe clasificarse como PRE o POS antes de registrar al estudiante`.            |
| PRE/POS con escuela de otro tipo                                         | `400`: `El tipo de la escuela indicada no coincide con el tipo del estudiante`.                            |
| Escuela/facultad inexistentes o pertenencia incompatible                 | Se conservan los mensajes `400` actuales.                                                                  |
| Reclasificacion de escuela incompatible con alumnos                      | `400`: `No se puede cambiar el tipo de la escuela porque tiene estudiantes de un tipo incompatible`.       |
| Tipo y documento omitidos o null                                         | Alta permitida; no se crean valores artificiales.                                                          |
| Creacion remota sin codigo, fallo local, conflicto o matricula pendiente | Se conservan los codigos Q10 y `retryAllowed` actuales; ver [Q10](q10.md).                                 |
| Upload correcto y alta fallida/cancelada                                 | El enlace puede conservarse para corregir el formulario; no hay limpieza automatica de archivos huerfanos. |

Drive, Q10 y PostgreSQL no comparten transaccion. La idempotencia local no garantiza que repetir el POST remoto sea seguro. No reintentar automaticamente resultados parciales o inciertos.

## SQL y despliegue

- `estudiantes.tipo_estudiante` ya existe en la base local inspeccionada como `varchar(3)` nullable, con CHECK PRE/POS/PG. La implementacion agrega su mapeo; no recrea la columna ni modifica datos.
- Ejecutar [add-tipo-to-escuelas.sql](../sql/add-tipo-to-escuelas.sql) **antes de desplegar** para agregar `escuelas.tipo` nullable y CHECK PRE/POS. El script es repetible y no clasifica registros historicos.
- Verificar por ambiente la columna existente de estudiantes; no usar `synchronize` ni atribuir a produccion el esquema observado localmente.
- Clasificar las escuelas mediante `PATCH /escuelas/:id` antes de utilizarlas en altas PRE/POS. No asignar PRE por defecto.
- El cambio de `POST /escuelas` requiere actualizar sus clientes para enviar tipo; el alta Q10 conserva compatibilidad porque sus nuevos campos son opcionales.

## Criterios y evidencia

| CA            | Escenario                                                                                            |
| ------------- | ---------------------------------------------------------------------------------------------------- |
| CA-EST-002-01 | Persistir y consultar PRE, POS y PG junto con documento e idQ10 cuando se proporcionen.              |
| CA-EST-002-02 | Admitir PG con o sin relaciones academicas.                                                          |
| CA-EST-002-03 | Admitir tipo omitido/null; rechazar valores fuera del dominio antes de Q10.                          |
| CA-EST-002-04 | Crear escuelas PRE/POS; rechazar PG, ausencia/null en alta y null en PATCH.                          |
| CA-EST-002-05 | Validar coincidencia PRE/POS y rechazar escuelas sin clasificar, incluso sin facultad en el request. |
| CA-EST-002-06 | Persistir el enlace documental proporcionado y recuperarlo en la consulta local.                     |
| CA-EST-002-07 | Admitir documento omitido/null y conservar el existente; rechazar URL vacia o invalida.              |
| CA-EST-002-08 | Excluir los campos locales de toda peticion Q10.                                                     |
| CA-EST-002-09 | Mantener los errores parciales y la respuesta exitosa actual.                                        |
| CA-EST-002-10 | SQL repetible, conservando historicos sin clasificar ni modificar sus IDs.                           |

La matriz SDD enlaza el alta Q10 con esta feature y sus pruebas unitarias, HTTP y PostgreSQL aislado. Las pruebas con Q10/Drive simulados no acreditan envio real ni la pantalla frontend.

## Politicas de upload pendientes

Se reutiliza `viewLink` como referencia, sin verificar por API Drive que corresponda a una carga previa de DNIS. No se cambian permisos publicos actuales, formatos/tamanos admitidos ni limpieza de archivos huerfanos. Estas decisiones continuan en BL-UPL-001 y no se consideran resueltas por guardar `img_doc`.
