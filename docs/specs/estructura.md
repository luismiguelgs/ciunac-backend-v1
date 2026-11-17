# Spec: Estructura Academica

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El administrador configura idiomas, niveles, ciclos, modulos, grupos y aulas. Todos los controladores de este dominio requieren API key y PostgreSQL.

## Flujo principal y dependencias

1. Mantener idioma, nivel y ciclo antes de los grupos, rangos y tramites que los referencian.
2. Registrar modulos/periodos, su visibilidad y actividad segun DTO; la consulta de modulo activo es utilizada por seguimiento docente.
3. Crear grupos con docente, modulo, ciclo y aula, frecuencia y modalidad.
4. Consultar modulos visibles y los CRUD por identificador.
5. Las actualizaciones y eliminaciones usan las reglas actuales del servicio; no hay una maquina transversal de vigencia ni bloqueo de periodos implementada por esta spec.

## Alternativas y datos

Datos: Idioma, Nivel, Ciclo, Modulo, Grupo y Aula, vinculados con docentes y otros procesos. Las FK pueden rechazar referencias inexistentes. Un recurso ausente puede resultar en 200 null o respuesta vacia segun servicio; Swagger no cambia esa politica.

## Contratos y aceptacion

[OpenAPI](../api/openapi.json) define los DTOs, respuestas y parametros. Las historias HU-IDI, HU-NIV, HU-CIC, HU-MOD, HU-GRU y HU-AUL describen el CRUD y la matriz enlaza cada operacion con pruebas HTTP/seguridad.

## Frontend

Los selectores deben utilizar identificadores reales. El nombre del modulo representa el periodo utilizado en consultas de encuesta; no asumir que cualquier cadena tiene formato YYYY-MM.
