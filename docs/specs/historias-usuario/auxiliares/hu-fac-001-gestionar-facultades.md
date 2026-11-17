# HU-FAC-001: Gestionar facultades

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-FAC-001. Requisito: RF-FAC-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [auxiliares.md](../../auxiliares.md).

## Historia y objetivo

Como administrador de catalogos, quiero gestionar facultades, para mantener el catalogo de facultades utilizado por estudiantes y escuelas.

Mantener el catalogo de facultades utilizado por estudiantes y escuelas.

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
| `POST /facultades` | `FacultadesController_create` | Body: CreateFacultadeDto | api-key  | 201, 400, 401 |
| `GET /facultades` | `FacultadesController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /facultades/:id` | `FacultadesController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /facultades/:id` | `FacultadesController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /facultades/:id` | `FacultadesController_update` | Param: id; Body: UpdateFacultadeDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/auxiliares/facultades/entities/facultad.entity.ts](../../../../src/modules/auxiliares/facultades/entities/facultad.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-FAC-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP FacultadesController_create`, `HTTP FacultadesController_findAll`, `HTTP FacultadesController_findOne`, `HTTP FacultadesController_remove`, `HTTP FacultadesController_update`.
- **CA-FAC-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC FacultadesController_create`, `SEC FacultadesController_findAll`, `SEC FacultadesController_findOne`, `SEC FacultadesController_remove`, `SEC FacultadesController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/auxiliares/facultades/facultades.controller.ts](../../../../src/modules/auxiliares/facultades/facultades.controller.ts).
- [src/modules/auxiliares/facultades/facultades.service.ts](../../../../src/modules/auxiliares/facultades/facultades.service.ts).
- [src/modules/auxiliares/facultades/dto/create-facultade.dto.ts](../../../../src/modules/auxiliares/facultades/dto/create-facultade.dto.ts).
- [src/modules/auxiliares/facultades/dto/update-facultade.dto.ts](../../../../src/modules/auxiliares/facultades/dto/update-facultade.dto.ts).
