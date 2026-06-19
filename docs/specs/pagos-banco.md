# Spec: Pagos Banco

## Objetivo funcional

Procesar pagos bancarios desde CSV, asociarlos con solicitudes y permitir reverificacion de pagos pendientes o no verificados.

## Actores

- Administrador de recaudo.
- Sistema bancario que produce CSV.
- Frontend administrativo.

## Precondiciones

- Archivo CSV disponible.
- `API_KEY` valida.
- Solicitudes existentes para asociar pagos cuando aplique.
- Base PostgreSQL disponible.

## Flujo principal

1. El administrador sube un CSV a `POST /pagos-banco/upload`.
2. El controller valida que exista archivo y sea CSV.
3. El service parsea filas con `csv-parser`.
4. El sistema crea o actualiza registros `PagosBanco`.
5. El sistema intenta resolver relacion con `Solicitud`.
6. El administrador consulta pagos o ejecuta `POST /pagos-banco/reverify`.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| No se envia archivo | `400 Bad Request`. |
| Archivo no CSV | `400 Bad Request`. |
| Pago inexistente por id | `404 Not Found`. |
| Fila invalida | Debe registrarse/rechazarse de forma controlada segun implementacion. |

## Reglas de negocio

- Solo se aceptan archivos CSV por extension o mimetype.
- La reverificacion debe intentar asociar pagos previamente no verificados.
- Las operaciones CRUD mantienen registros de pagos individuales.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/pagos-banco/upload` | ApiKey | `multipart/form-data` con CSV | Resultado de procesamiento |
| `POST` | `/pagos-banco/reverify` | ApiKey | N/A o filtros | Resultado de reverificacion |
| `POST` | `/pagos-banco` | ApiKey | `CreatePagosBancoDto` | Pago creado |
| `GET` | `/pagos-banco` | ApiKey | N/A | Lista de pagos |
| `GET` | `/pagos-banco/:id` | ApiKey | Id | Pago encontrado |
| `PATCH` | `/pagos-banco/:id` | ApiKey | `UpdatePagosBancoDto` | Pago actualizado |
| `DELETE` | `/pagos-banco/:id` | ApiKey | Id | Pago eliminado |

## Datos involucrados

- Entidades: `PagosBanco`, `Solicitud`.
- DTOs: `CreatePagosBancoDto`, `UpdatePagosBancoDto`.

## Integraciones externas

- Entrada externa: CSV bancario.
- No se observa llamada directa al banco; el archivo es la frontera de integracion.

## Criterios de aceptacion

- Dado un CSV valido, cuando se sube, entonces se procesan pagos sin error.
- Dado un archivo no CSV, cuando se sube, entonces se rechaza con `400`.
- Dado pagos no verificados, cuando se ejecuta reverificacion, entonces se intenta resolver asociacion con solicitudes.
- Dado un id inexistente, cuando se consulta pago, entonces se responde `404`.

## Casos de prueba sugeridos

- Unit: parseo CSV y resolucion/rechazo de pagos.
- Integration: upload con CSV valido e invalido.
- E2E: upload -> listado -> reverificacion.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controller | `src/modules/administrativas/pagos-banco/pagos-banco.controller.ts` |
| Service | `PagosBancoService` |
| Data | `PagosBanco`, `Solicitud` |
