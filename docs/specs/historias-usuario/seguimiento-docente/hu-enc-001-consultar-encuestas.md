# HU-ENC-001: Consultar encuestas

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-ENC-001. Requisito: RF-ENC-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [seguimiento-docente.md](../../seguimiento-docente.md).

## Historia y objetivo

Como coordinador de evaluacion docente, quiero consultar encuestas, para consultar respuestas filtradas por docente y periodo.

Consultar respuestas filtradas por docente y periodo.

## Actores y precondiciones

- Actor: coordinador de evaluacion docente; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `findByDocenteAndModulo` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /encuesta-respuestas/buscar` | `EncuestaRespuestasController_findByDocenteAndModulo` | Query: docenteId; Query: moduloId | api-key  | 200, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/seguimiento_docente/encuesta_respuestas/entities/encuesta_respuesta.entity.ts](../../../../src/modules/seguimiento_docente/encuesta_respuestas/entities/encuesta_respuesta.entity.ts).
- [src/modules/seguimiento_docente/encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity.ts](../../../../src/modules/seguimiento_docente/encuesta_respuestas_detalle/entities/encuesta_respuestas_detalle.entity.ts).
- [src/modules/principales/docentes/entities/docente.entity.ts](../../../../src/modules/principales/docentes/entities/docente.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-ENC-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP EncuestaRespuestasController_findByDocenteAndModulo`.
- **CA-ENC-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC EncuestaRespuestasController_findByDocenteAndModulo`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/seguimiento_docente/encuesta_respuestas/encuesta_respuestas.controller.ts](../../../../src/modules/seguimiento_docente/encuesta_respuestas/encuesta_respuestas.controller.ts).
- [src/modules/seguimiento_docente/encuesta_respuestas/encuesta_respuestas.service.ts](../../../../src/modules/seguimiento_docente/encuesta_respuestas/encuesta_respuestas.service.ts).
