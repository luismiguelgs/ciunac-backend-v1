# HU-CON-001: Consultar y mantener constancias

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-CON-001. Requisito: RF-CON-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [constancias.md](../../constancias.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero consultar y mantener constancias, para consultar y actualizar constancias relacionadas con solicitudes.

Consultar y actualizar constancias relacionadas con solicitudes.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `findAll`, `findByAceptado`, `findByImpreso`, `findBySolicitudId`, `findOne`, `findPendientes`, `update` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /constancias` | `ConstanciasController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /constancias/aceptados` | `ConstanciasController_findByAceptado` | Sin body | api-key  | 200, 401 |
| `GET /constancias/impresos` | `ConstanciasController_findByImpreso` | Sin body | api-key  | 200, 401 |
| `GET /constancias/solicitud/:solicitudId` | `ConstanciasController_findBySolicitudId` | Param: solicitudId | api-key  | 200, 401 |
| `GET /constancias/:id` | `ConstanciasController_findOne` | Param: id | api-key  | 200, 401 |
| `GET /constancias/pendientes` | `ConstanciasController_findPendientes` | Sin body | api-key  | 200, 401 |
| `PATCH /constancias/:id` | `ConstanciasController_update` | Param: id; Body: UpdateConstanciaDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/administrativas/constancias/schemas/constancia.schema.ts](../../../../src/modules/administrativas/constancias/schemas/constancia.schema.ts).

## Criterios de aceptacion y evidencia

- **CA-CON-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP ConstanciasController_findAll`, `HTTP ConstanciasController_findByAceptado`, `HTTP ConstanciasController_findByImpreso`, `HTTP ConstanciasController_findBySolicitudId`, `HTTP ConstanciasController_findOne`, `HTTP ConstanciasController_findPendientes`, `HTTP ConstanciasController_update`.
- **CA-CON-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC ConstanciasController_findAll`, `SEC ConstanciasController_findByAceptado`, `SEC ConstanciasController_findByImpreso`, `SEC ConstanciasController_findBySolicitudId`, `SEC ConstanciasController_findOne`, `SEC ConstanciasController_findPendientes`, `SEC ConstanciasController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/constancias/constancias.controller.ts](../../../../src/modules/administrativas/constancias/constancias.controller.ts).
- [src/modules/administrativas/constancias/constancias.service.ts](../../../../src/modules/administrativas/constancias/constancias.service.ts).
- [src/modules/administrativas/constancias/dto/update-constancia.dto.ts](../../../../src/modules/administrativas/constancias/dto/update-constancia.dto.ts).
