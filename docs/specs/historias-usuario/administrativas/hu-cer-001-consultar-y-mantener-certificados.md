# HU-CER-001: Consultar y mantener certificados

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-CER-001. Requisito: RF-CER-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [certificados.md](../../certificados.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero consultar y mantener certificados, para consultar documentos MongoDB por solicitud, estado de firma y formato.

Consultar documentos MongoDB por solicitud, estado de firma y formato.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `findAceptados`, `findAll`, `findByImpreso`, `findBySolicitudId`, `findFirmados`, `findOne`, `findPendientes`, `update` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /certificados/aceptados` | `CertificadosController_findAceptados` | Sin body | api-key  | 200, 401 |
| `GET /certificados` | `CertificadosController_findAll` | Sin body | api-key  | 200, 401 |
| `GET /certificados/impresos` | `CertificadosController_findByImpreso` | Query: impreso | api-key  | 200, 401 |
| `GET /certificados/solicitud/:solicitudId` | `CertificadosController_findBySolicitudId` | Param: solicitudId | api-key  | 200, 401 |
| `GET /certificados/firmados` | `CertificadosController_findFirmados` | Sin body | api-key  | 200, 401 |
| `GET /certificados/:id` | `CertificadosController_findOne` | Param: id | api-key  | 200, 401 |
| `GET /certificados/pendientes` | `CertificadosController_findPendientes` | Sin body | api-key  | 200, 401 |
| `PATCH /certificados/:id` | `CertificadosController_update` | Param: id; Body: UpdateCertificadoDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/administrativas/certificados/schemas/certificado.schema.ts](../../../../src/modules/administrativas/certificados/schemas/certificado.schema.ts).

## Criterios de aceptacion y evidencia

- **CA-CER-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP CertificadosController_findAceptados`, `HTTP CertificadosController_findAll`, `HTTP CertificadosController_findByImpreso`, `HTTP CertificadosController_findBySolicitudId`, `HTTP CertificadosController_findFirmados`, `HTTP CertificadosController_findOne`, `HTTP CertificadosController_findPendientes`, `HTTP CertificadosController_update`.
- **CA-CER-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC CertificadosController_findAceptados`, `SEC CertificadosController_findAll`, `SEC CertificadosController_findByImpreso`, `SEC CertificadosController_findBySolicitudId`, `SEC CertificadosController_findFirmados`, `SEC CertificadosController_findOne`, `SEC CertificadosController_findPendientes`, `SEC CertificadosController_update`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/certificados/certificados.controller.ts](../../../../src/modules/administrativas/certificados/certificados.controller.ts).
- [src/modules/administrativas/certificados/certificados.service.ts](../../../../src/modules/administrativas/certificados/certificados.service.ts).
- [src/modules/administrativas/certificados/dto/update-certificado.dto.ts](../../../../src/modules/administrativas/certificados/dto/update-certificado.dto.ts).
