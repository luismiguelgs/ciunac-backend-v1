# HU-CER-003: Adjuntar archivo de certificado

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-CER-003. Requisito: RF-CER-003. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [certificados.md](../../certificados.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero adjuntar archivo de certificado, para cargar el archivo con multipart y asociar la informacion de Drive al certificado existente.

Cargar el archivo con multipart y asociar la informacion de Drive al certificado existente.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `subirArchivo` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /certificados/:id/archivo` | `CertificadosController_subirArchivo` | multipart; Param: id; Body: UploadCertificadoDto | api-key  | 201, 400, 401, 404, 500 |

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

- **CA-CER-003-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP CertificadosController_subirArchivo`.
- **CA-CER-003-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC CertificadosController_subirArchivo`.
- **CA-CER-003-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT certificado guarda driveId luego URL firmada y solicitud terminada`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/certificados/certificados.controller.ts](../../../../src/modules/administrativas/certificados/certificados.controller.ts).
- [src/modules/administrativas/certificados/certificados.service.ts](../../../../src/modules/administrativas/certificados/certificados.service.ts).
- [src/modules/administrativas/certificados/dto/upload-certificado.dto.ts](../../../../src/modules/administrativas/certificados/dto/upload-certificado.dto.ts).
