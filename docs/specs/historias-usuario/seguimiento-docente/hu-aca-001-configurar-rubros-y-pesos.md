# HU-ACA-001: Configurar rubros y pesos

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-ACA-001. Requisito: RF-ACA-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [seguimiento-docente.md](../../seguimiento-docente.md).

## Historia y objetivo

Como coordinador de evaluacion docente, quiero configurar rubros y pesos, para mantener los rubros y pesos usados en el calculo de cumplimiento.

Mantener los rubros y pesos usados en el calculo de cumplimiento.

## Actores y precondiciones

- Actor: coordinador de evaluacion docente; frontend CIUNAC como cliente HTTP.
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
| `POST /academico-administrativo` | `AcademicoAdministrativoController_create` | Body: CreateAcademicoAdministrativoDto | api-key  | 201, 400, 401 |
| `GET /academico-administrativo` | `AcademicoAdministrativoController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /academico-administrativo/:id` | `AcademicoAdministrativoController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /academico-administrativo/:id` | `AcademicoAdministrativoController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /academico-administrativo/:id` | `AcademicoAdministrativoController_update` | Param: id; Body: UpdateAcademicoAdministrativoDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/seguimiento_docente/academico_administrativo/entities/academico_administrativo.entity.ts](../../../../src/modules/seguimiento_docente/academico_administrativo/entities/academico_administrativo.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-ACA-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP AcademicoAdministrativoController_create`, `HTTP AcademicoAdministrativoController_findAll`, `HTTP AcademicoAdministrativoController_findOne`, `HTTP AcademicoAdministrativoController_remove`, `HTTP AcademicoAdministrativoController_update`.
- **CA-ACA-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC AcademicoAdministrativoController_create`, `SEC AcademicoAdministrativoController_findAll`, `SEC AcademicoAdministrativoController_findOne`, `SEC AcademicoAdministrativoController_remove`, `SEC AcademicoAdministrativoController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/seguimiento_docente/academico_administrativo/academico_administrativo.controller.ts](../../../../src/modules/seguimiento_docente/academico_administrativo/academico_administrativo.controller.ts).
- [src/modules/seguimiento_docente/academico_administrativo/academico_administrativo.service.ts](../../../../src/modules/seguimiento_docente/academico_administrativo/academico_administrativo.service.ts).
- [src/modules/seguimiento_docente/academico_administrativo/dto/create-academico_administrativo.dto.ts](../../../../src/modules/seguimiento_docente/academico_administrativo/dto/create-academico_administrativo.dto.ts).
- [src/modules/seguimiento_docente/academico_administrativo/dto/update-academico_administrativo.dto.ts](../../../../src/modules/seguimiento_docente/academico_administrativo/dto/update-academico_administrativo.dto.ts).
