# HU-EXU-004: Gestionar participantes y resultados

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-EXU-004. Requisito: RF-EXU-004. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [examen-ubicacion.md](../../examen-ubicacion.md).

## Historia y objetivo

Como administrativo de examenes, quiero gestionar participantes y resultados, para persistir participantes activos y resultados proporcionados por el cliente, y efectuar baja logica.

Persistir participantes activos y resultados proporcionados por el cliente, y efectuar baja logica.

## Actores y precondiciones

- Actor: administrativo de examenes; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `create`, `findAll`, `findByDocumentNumber`, `findByExamen`, `findOne`, `remove` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /detallesubicacion` | `DetallesubicacionController_create` | Body: CreateDetallesubicacionDto | api-key  | 201, 400, 401 |
| `GET /detallesubicacion` | `DetallesubicacionController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /detallesubicacion/estudiante/documento/:documentNumber` | `DetallesubicacionController_findByDocumentNumber` | Param: documentNumber | api-key  | 200, 401 |
| `GET /detallesubicacion/examen/:id` | `DetallesubicacionController_findByExamen` | Param: id | api-key  | 200, 401 |
| `GET /detallesubicacion/:id` | `DetallesubicacionController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /detallesubicacion/:id` | `DetallesubicacionController_remove` | Param: id | api-key  | 200, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/examen_ubicacion/detallesubicacion/entities/detallesubicacion.entity.ts](../../../../src/modules/examen_ubicacion/detallesubicacion/entities/detallesubicacion.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-EXU-004-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP DetallesubicacionController_create`, `HTTP DetallesubicacionController_findAll`, `HTTP DetallesubicacionController_findByDocumentNumber`, `HTTP DetallesubicacionController_findByExamen`, `HTTP DetallesubicacionController_findOne`, `HTTP DetallesubicacionController_remove`.
- **CA-EXU-004-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC DetallesubicacionController_create`, `SEC DetallesubicacionController_findAll`, `SEC DetallesubicacionController_findByDocumentNumber`, `SEC DetallesubicacionController_findByExamen`, `SEC DetallesubicacionController_findOne`, `SEC DetallesubicacionController_remove`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/examen_ubicacion/detallesubicacion/detallesubicacion.controller.ts](../../../../src/modules/examen_ubicacion/detallesubicacion/detallesubicacion.controller.ts).
- [src/modules/examen_ubicacion/detallesubicacion/detallesubicacion.service.ts](../../../../src/modules/examen_ubicacion/detallesubicacion/detallesubicacion.service.ts).
- [src/modules/examen_ubicacion/detallesubicacion/dto/create-detallesubicacion.dto.ts](../../../../src/modules/examen_ubicacion/detallesubicacion/dto/create-detallesubicacion.dto.ts).
