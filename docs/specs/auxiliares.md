# Spec: Catalogos Auxiliares

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El operador mantiene escuelas, facultades, estados y textos. Las operaciones requieren API key; PostgreSQL almacena los tres primeros catalogos y MongoDB los textos.

## Flujo y reglas

1. Consultar catalogos antes de presentar selectores de otros procesos.
2. Crear o actualizar mediante el DTO correspondiente; conservar IDs al referenciarlos.
3. Consultar estados por referencia: el mismo concepto numerico no debe extrapolarse entre solicitudes y examenes.
4. Eliminar mediante la operacion existente; las FK y el resultado actual del servicio determinan la respuesta.
5. Textos son documentos flexibles y no activan por si mismos emision o firma de certificados.

## Estados de solicitud observados

| ID | Nombre |
| --- | --- |
| 1 | NUEVO |
| 2 | ASIGNADO |
| 3 | TERMINADO |
| 4 | PAGADO |
| 5 | RECHAZADO |
| 12 | OBSERVADO |

Para rechazo se valida el registro con referencia SOLICITUD. Para examen, la generacion actual de acta exige estado 8 y escribe 13; es una regla distinta.

## Contratos, errores y trazabilidad

Ver [inventario](../api/endpoints.md), [historias](use-cases-index.md) y [OpenAPI](../api/openapi.json). CA-ESC, CA-FAC, CA-EDO y CA-TXT enlazan contratos y seguridad. Campos no admitidos producen 400 cuando el DTO aplica; los servicios no normalizan todos los recursos ausentes a 404.

## Integracion frontend

Cargar los valores del catalogo correspondiente, enviar IDs y no deducir etiquetas de estados usando numeros compartidos entre dominios.

## Tipo de escuela

La [feature estudiante nuevo](estudiante-nuevo.md) incorpora `escuelas.tipo`: PRE/POS obligatorio en POST y opcional en PATCH, sin admitir null en el request. GET expone null para escuelas historicas sin clasificar. PG corresponde a publico en general y no es tipo de escuela. El backend rechaza reclasificaciones incompatibles con alumnos PRE/POS vinculados; PG y alumnos sin tipo no bloquean el cambio. Ejecutar [el SQL](../sql/add-tipo-to-escuelas.sql) antes del despliegue y clasificar historicos con PATCH, sin asignar tipos automaticamente.
