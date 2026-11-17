# HU-RES-002: Calcular resultado docente

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-RES-002. Requisito: RF-RES-002. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [seguimiento-docente.md](../../seguimiento-docente.md).

## Historia y objetivo

Como coordinador de evaluacion docente, quiero calcular resultado docente, para sumar encuesta ponderada, cumplimiento ponderado y perfil profesional ponderado y guardar el resultado.

Sumar encuesta ponderada, cumplimiento ponderado y perfil profesional ponderado y guardar el resultado.

## Actores y precondiciones

- Actor: coordinador de evaluacion docente; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: publica. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `generarResultado` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /perfil-docente-resultados/generar` | `PerfilDocenteResultadosController_generarResultado` | Body: { moduloId: number; docenteId: string } | Publica  | 201, 400 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/seguimiento_docente/perfil_docente_resultados/entities/perfil_docente_resultado.entity.ts](../../../../src/modules/seguimiento_docente/perfil_docente_resultados/entities/perfil_docente_resultado.entity.ts).
- [src/modules/seguimiento_docente/encuesta_metricas_docente/entities/encuesta_metricas_docente.entity.ts](../../../../src/modules/seguimiento_docente/encuesta_metricas_docente/entities/encuesta_metricas_docente.entity.ts).
- [src/modules/seguimiento_docente/cumplimiento_docente/entities/cumplimiento_docente.entity.ts](../../../../src/modules/seguimiento_docente/cumplimiento_docente/entities/cumplimiento_docente.entity.ts).
- [src/modules/seguimiento_docente/perfil_docente/entities/perfil_docente.entity.ts](../../../../src/modules/seguimiento_docente/perfil_docente/entities/perfil_docente.entity.ts).
- [src/modules/seguimiento_docente/encuesta_respuestas/entities/encuesta_respuesta.entity.ts](../../../../src/modules/seguimiento_docente/encuesta_respuestas/entities/encuesta_respuesta.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-RES-002-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP PerfilDocenteResultadosController_generarResultado`.
- **CA-RES-002-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC PerfilDocenteResultadosController_generarResultado`.
- **CA-RES-002-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT resultados docentes persisten formula detalle y ranking`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/seguimiento_docente/perfil_docente_resultados/perfil_docente_resultados.controller.ts](../../../../src/modules/seguimiento_docente/perfil_docente_resultados/perfil_docente_resultados.controller.ts).
- [src/modules/seguimiento_docente/perfil_docente_resultados/perfil_docente_resultados.service.ts](../../../../src/modules/seguimiento_docente/perfil_docente_resultados/perfil_docente_resultados.service.ts).
