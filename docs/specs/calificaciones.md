# Spec: Calificaciones Academicas

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El operador academico mantiene evaluaciones, notas, notas finales y actas de notas. Las rutas requieren API key, con las validaciones de cada DTO.

## Flujo y reglas

1. Configurar evaluaciones y datos academicos relacionados.
2. Persistir las notas y las notas finales recibidas por sus DTOs.
3. Guardar el documento de acta de notas en MongoDB y consultar los documentos existentes.
4. Actualizar por identificador mediante las rutas disponibles.

El CRUD de notas finales no implica un motor automatico de promedio o cierre academico: se documenta la persistencia actual. ActaNota es distinto de ActaExamenUbicacion y tiene un contrato propio. No existe ruta DELETE de actanotas en el codigo actual.

## Datos, alternativas y efectos

PostgreSQL: Evaluacion, Nota y Notasfinal. MongoDB: ActaNota. Las relaciones y campos estan en [OpenAPI](../api/openapi.json). Conservar respuestas null y errores actuales; no asumir 404 en todas las consultas. No hay envio de correo ni firma automatica en estos CRUD.

## Frontend y aceptacion

El frontend envia los campos del contrato y consulta las notas persistidas. Las historias HU-EVA, HU-NOT, HU-NFI y HU-ACT y sus CA estan enlazadas con operaciones y pruebas en [el indice](use-cases-index.md).
