# HU-PAG-001: Consultar y mantener pagos

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-PAG-001. Requisito: RF-PAG-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [pagos-banco.md](../../pagos-banco.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero consultar y mantener pagos, para gestionar pagos y filtrar por periodo; controlar duplicidad por voucher y fecha efectiva.

Gestionar pagos y filtrar por periodo; controlar duplicidad por voucher y fecha efectiva.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `create`, `findAll`, `findOne`, `remove`, `update` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /pagos-banco` | `PagosBancoController_create` | Body: CreatePagosBancoDto | api-key  | 201, 400, 401 |
| `GET /pagos-banco` | `PagosBancoController_findAll` | Query: FilterPagosBancoDto | api-key  | 200, 401 |
| `GET /pagos-banco/:id` | `PagosBancoController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /pagos-banco/:id` | `PagosBancoController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /pagos-banco/:id` | `PagosBancoController_update` | Param: id; Body: UpdatePagosBancoDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/administrativas/pagos-banco/entities/pagos-banco.entity.ts](../../../../src/modules/administrativas/pagos-banco/entities/pagos-banco.entity.ts).
- [src/modules/administrativas/solicitudes/entities/solicitud.entity.ts](../../../../src/modules/administrativas/solicitudes/entities/solicitud.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-PAG-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP PagosBancoController_create`, `HTTP PagosBancoController_findAll`, `HTTP PagosBancoController_findOne`, `HTTP PagosBancoController_remove`, `HTTP PagosBancoController_update`.
- **CA-PAG-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC PagosBancoController_create`, `SEC PagosBancoController_findAll`, `SEC PagosBancoController_findOne`, `SEC PagosBancoController_remove`, `SEC PagosBancoController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/pagos-banco/pagos-banco.controller.ts](../../../../src/modules/administrativas/pagos-banco/pagos-banco.controller.ts).
- [src/modules/administrativas/pagos-banco/pagos-banco.service.ts](../../../../src/modules/administrativas/pagos-banco/pagos-banco.service.ts).
- [src/modules/administrativas/pagos-banco/dto/create-pagos-banco.dto.ts](../../../../src/modules/administrativas/pagos-banco/dto/create-pagos-banco.dto.ts).
- [src/modules/administrativas/pagos-banco/dto/filter-pagos-banco.dto.ts](../../../../src/modules/administrativas/pagos-banco/dto/filter-pagos-banco.dto.ts).
- [src/modules/administrativas/pagos-banco/dto/update-pagos-banco.dto.ts](../../../../src/modules/administrativas/pagos-banco/dto/update-pagos-banco.dto.ts).
