# HU-PAG-002: Conciliar CSV bancario

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-PAG-002. Requisito: RF-PAG-002. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [pagos-banco.md](../../pagos-banco.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero conciliar csv bancario, para validar todas las filas y conciliar en transaccion; distinguir duplicados exactos y vouchers reutilizados.

Validar todas las filas y conciliar en transaccion; distinguir duplicados exactos y vouchers reutilizados.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `uploadAndProcess` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /pagos-banco/upload` | `PagosBancoController_uploadFile` | multipart; Sin body | api-key  | 201, 400, 401, 500 |

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

- **CA-PAG-002-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP PagosBancoController_uploadFile`.
- **CA-PAG-002-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC PagosBancoController_uploadFile`.
- **CA-PAG-002-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT conciliacion CSV paga observa omite duplicados y revierte lote invalido`, `INT conciliacion revierte cambios si falla insercion bancaria`, `INT fecha bancaria caracteriza riesgo de persistencia fuera de UTC`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/pagos-banco/pagos-banco.controller.ts](../../../../src/modules/administrativas/pagos-banco/pagos-banco.controller.ts).
- [src/modules/administrativas/pagos-banco/pagos-banco.service.ts](../../../../src/modules/administrativas/pagos-banco/pagos-banco.service.ts).
