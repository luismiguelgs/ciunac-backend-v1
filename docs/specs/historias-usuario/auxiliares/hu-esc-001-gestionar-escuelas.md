# HU-ESC-001: Gestionar escuelas

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-ESC-001. Requisito: RF-ESC-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [auxiliares.md](../../auxiliares.md).

## Historia y objetivo

Como administrador de catalogos, quiero gestionar escuelas, para mantener escuelas y su facultad relacionada.

Mantener escuelas y su facultad relacionada.

## Actores y precondiciones

- Actor: administrador de catalogos; frontend CIUNAC como cliente HTTP.
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
| `POST /escuelas` | `EscuelasController_create` | Body: CreateEscuelaDto | api-key  | 201, 400, 401 |
| `GET /escuelas` | `EscuelasController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /escuelas/:id` | `EscuelasController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /escuelas/:id` | `EscuelasController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /escuelas/:id` | `EscuelasController_update` | Param: id; Body: UpdateEscuelaDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/auxiliares/escuelas/entities/escuela.entity.ts](../../../../src/modules/auxiliares/escuelas/entities/escuela.entity.ts).
- [src/modules/principales/estudiantes/entities/estudiante.entity.ts](../../../../src/modules/principales/estudiantes/entities/estudiante.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-ESC-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP EscuelasController_create`, `HTTP EscuelasController_findAll`, `HTTP EscuelasController_findOne`, `HTTP EscuelasController_remove`, `HTTP EscuelasController_update`.
- **CA-ESC-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC EscuelasController_create`, `SEC EscuelasController_findAll`, `SEC EscuelasController_findOne`, `SEC EscuelasController_remove`, `SEC EscuelasController_update`.
- **CA-ESC-001-03**: Escuelas PRE/POS, proteccion de alumnos incompatibles y SQL repetible que conserva historicos sin clasificar. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT estudiante nuevo persiste tipo documento y valida escuelas sin enviar campos locales a Q10`, `INT SQL escuelas tipo es repetible y conserva historicos sin clasificar`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/auxiliares/escuelas/escuelas.controller.ts](../../../../src/modules/auxiliares/escuelas/escuelas.controller.ts).
- [src/modules/auxiliares/escuelas/escuelas.service.ts](../../../../src/modules/auxiliares/escuelas/escuelas.service.ts).
- [src/modules/auxiliares/escuelas/dto/create-escuela.dto.ts](../../../../src/modules/auxiliares/escuelas/dto/create-escuela.dto.ts).
- [src/modules/auxiliares/escuelas/dto/update-escuela.dto.ts](../../../../src/modules/auxiliares/escuelas/dto/update-escuela.dto.ts).
