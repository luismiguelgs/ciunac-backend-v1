# HU-EXU-007: Generar y preservar acta inmutable

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-EXU-007. Requisito: RF-EXU-007. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [examen-ubicacion.md](../../examen-ubicacion.md).

## Historia y objetivo

Como administrativo de examenes, quiero generar un acta inmutable, para preservar los resultados y su trazabilidad.

Consolidar una fotografia unica del examen terminado y rechazar cambios o eliminaciones posteriores.

## Actores y precondiciones

- Actor: administrativo de examenes; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key + jwt. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `create`, `remove`, `update` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /actasexamenubicacion` | `ActasexamenubicacionController_create` | Body: CreateActasexamenubicacionDto | api-key + jwt gestionar_examen_ubicacion | 201, 400, 401, 403, 404, 409, 500 |
| `DELETE /actasexamenubicacion/:id` | `ActasexamenubicacionController_remove` | Param: id | api-key + jwt gestionar_examen_ubicacion | 401, 403, 409 |
| `PATCH /actasexamenubicacion/:id` | `ActasexamenubicacionController_update` | Param: id; Body: UpdateActasexamenubicacionDto | api-key + jwt gestionar_examen_ubicacion | 400, 401, 403, 409 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/administrativas/solicitudes/entities/solicitud.entity.ts](../../../../src/modules/administrativas/solicitudes/entities/solicitud.entity.ts).
- [src/modules/examen_ubicacion/detallesubicacion/entities/detallesubicacion.entity.ts](../../../../src/modules/examen_ubicacion/detallesubicacion/entities/detallesubicacion.entity.ts).
- [src/modules/examen_ubicacion/examenesubicacion/entities/examenesubicacion.entity.ts](../../../../src/modules/examen_ubicacion/examenesubicacion/entities/examenesubicacion.entity.ts).
- [src/modules/examen_ubicacion/actasexamenubicacion/schemas/actasexamenubicacion.schema.ts](../../../../src/modules/examen_ubicacion/actasexamenubicacion/schemas/actasexamenubicacion.schema.ts).

## Criterios de aceptacion y evidencia

- **CA-EXU-007-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP ActasexamenubicacionController_create`, `HTTP ActasexamenubicacionController_remove`, `HTTP ActasexamenubicacionController_update`.
- **CA-EXU-007-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC ActasexamenubicacionController_create`, `SEC ActasexamenubicacionController_remove`, `SEC ActasexamenubicacionController_update`.
- **CA-EXU-007-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT acta unica inmutable actualiza examen y conserva snapshot`, `INT acta elimina insercion Mongo si falla actualizacion PostgreSQL`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/examen_ubicacion/actasexamenubicacion/actasexamenubicacion.controller.ts](../../../../src/modules/examen_ubicacion/actasexamenubicacion/actasexamenubicacion.controller.ts).
- [src/modules/examen_ubicacion/actasexamenubicacion/actasexamenubicacion.service.ts](../../../../src/modules/examen_ubicacion/actasexamenubicacion/actasexamenubicacion.service.ts).
- [src/modules/examen_ubicacion/actasexamenubicacion/dto/create-actasexamenubicacion.dto.ts](../../../../src/modules/examen_ubicacion/actasexamenubicacion/dto/create-actasexamenubicacion.dto.ts).
- [src/modules/examen_ubicacion/actasexamenubicacion/dto/update-actasexamenubicacion.dto.ts](../../../../src/modules/examen_ubicacion/actasexamenubicacion/dto/update-actasexamenubicacion.dto.ts).
