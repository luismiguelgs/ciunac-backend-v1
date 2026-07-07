# HU-EXU-008: Consultar actas y resultados

## Historia

**Como** administrativo autorizado, **quiero** listar las actas y consultar una por su identificador, **para** revisar la evidencia histórica de los exámenes procesados.

## Precondiciones

- El cliente presenta las credenciales requeridas.
- Para el detalle, el identificador MongoDB tiene formato válido.

## Criterios de aceptación

- Dadas actas existentes, cuando se ejecuta `GET /actasexamenubicacion`, entonces devuelve la colección sin modificar documentos.
- Dado un `_id` existente, cuando se ejecuta `GET /actasexamenubicacion/:id`, entonces devuelve el acta completa.
- Dado un `_id` inválido, cuando se consulta, entonces responde `400 Bad Request`.
- Dado un `_id` válido pero inexistente, cuando se consulta, entonces responde `404 Not Found`.
- La respuesta conserva los valores históricos aunque las entidades de PostgreSQL hayan cambiado después de publicar el acta.

## Rutas existentes

- `GET /actasexamenubicacion`
- `GET /actasexamenubicacion/:id`

## Reglas y dependencias

- No se crea una ruta de consulta por `examenId`.
- La lista y el detalle son operaciones de solo lectura.
- Los datos sensibles se entregan únicamente a clientes autorizados y no se escriben en logs.
