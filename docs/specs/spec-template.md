# Plantilla Spec-Driven

## Identificacion

- ID / version:
- Responsable por rol:
- Estado: Borrador / Especificado / Implementado. Verificado solo con evidencia de ejecucion.
- Alcance: AS-IS o propuesta TO-BE enlazada al backlog.
- Historia HU / caso CU / requisito RF:
- Implementacion y contratos afectados:

## Objetivo funcional y actores

Como [actor] quiero [accion] para [resultado]. Identificar al usuario, frontend y sistemas secundarios.

## Precondiciones

Catalogos, datos, estado inicial, autenticacion y permisos que realmente exige el backend.

## Flujo principal

1. Accion del usuario y datos recogidos por frontend.
2. Operacion HTTP y validaciones del backend.
3. Regla del servicio, consultas/persistencia y efectos externos.
4. Respuesta, estado final y actualizacion del frontend.

## Alternativas, errores y reglas

Documentar reglas con RF identificados, idempotencia, concurrencia, recursos inexistentes, compensacion y efectos parciales. No presuponer 404 ni normalizaciones ausentes del codigo.

## Contratos API

| operationId | Metodo / ruta | Seguridad / permiso | Request / multipart / query | Response / codigos |
| --- | --- | --- | --- | --- |

Incluir ejemplos representativos, tipos reales, opcionalidad, null, identificadores y decimales como texto cuando corresponda.

## Datos e integraciones

Entidades/schemas, relaciones, indices, estados y su referencia. CSV: columnas, separador, limites y politica de filas invalidas/duplicadas. Integraciones: entradas, salidas y fallos parciales.

## Criterios de aceptacion y pruebas

| CA | Dado / cuando / entonces | Tipo de evidencia | Archivo y nombre de prueba | Estado |
| --- | --- | --- | --- | --- |
| CA-DOM-001-01 | Contexto, accion y resultado medible | Contrato / integracion / unitaria | Referencia ejecutable | Implementado / pendiente |

## Trazabilidad y propuestas

Relacionar HU -> CU -> RF -> CA -> operationId -> controller/service -> entity/schema -> prueba en traceability.json. Separar limitaciones y propuestas en backlog.md. Identificar cambios que requieran despliegue o migracion.

## Integracion frontend

Datos capturados, confirmaciones, loading, errores y actualizacion de vistas. Indicar comportamiento requerido sin afirmar que el frontend ya fue implementado.
