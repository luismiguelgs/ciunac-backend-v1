# HU-NIV-001: Gestionar niveles

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-NIV-001. Requisito: RF-NIV-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [estructura.md](../../estructura.md).

## Historia y objetivo

Como coordinador academico, quiero gestionar niveles, para mantener niveles academicos y sus relaciones existentes.

Mantener niveles academicos y sus relaciones existentes.

## Actores y precondiciones

- Actor: coordinador academico; frontend CIUNAC como cliente HTTP.
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
| `POST /niveles` | `NivelesController_create` | Body: CreateNivelDto | api-key  | 201, 400, 401 |
| `GET /niveles` | `NivelesController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /niveles/:id` | `NivelesController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /niveles/:id` | `NivelesController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /niveles/:id` | `NivelesController_update` | Param: id; Body: UpdateNivelDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/estructura/niveles/entities/nivel.entity.ts](../../../../src/modules/estructura/niveles/entities/nivel.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-NIV-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP NivelesController_create`, `HTTP NivelesController_findAll`, `HTTP NivelesController_findOne`, `HTTP NivelesController_remove`, `HTTP NivelesController_update`.
- **CA-NIV-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC NivelesController_create`, `SEC NivelesController_findAll`, `SEC NivelesController_findOne`, `SEC NivelesController_remove`, `SEC NivelesController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/estructura/niveles/niveles.controller.ts](../../../../src/modules/estructura/niveles/niveles.controller.ts).
- [src/modules/estructura/niveles/niveles.service.ts](../../../../src/modules/estructura/niveles/niveles.service.ts).
- [src/modules/estructura/niveles/dto/create-nivel.dto.ts](../../../../src/modules/estructura/niveles/dto/create-nivel.dto.ts).
- [src/modules/estructura/niveles/dto/update-nivel.dto.ts](../../../../src/modules/estructura/niveles/dto/update-nivel.dto.ts).
