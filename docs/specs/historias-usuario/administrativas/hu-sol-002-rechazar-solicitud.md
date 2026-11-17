# HU-SOL-002: Rechazar solicitud

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-SOL-002. Requisito: RF-SOL-002. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [solicitudes-administrativas.md](../../solicitudes-administrativas.md).

## Historia y objetivo

Como administrativo de CIUNAC, quiero rechazar solicitud, para guardar observaciones y estado 5; notificar sin revertir el rechazo si falla SMTP.

Guardar observaciones y estado 5; notificar sin revertir el rechazo si falla SMTP.

## Actores y precondiciones

- Actor: administrativo de CIUNAC; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `reject` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `PATCH /solicitudes/:id/rechazo` | `SolicitudesController_reject` | Param: id; Body: RejectSolicitudDto | api-key  | 200, 400, 401, 404, 500 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/administrativas/solicitudes/entities/solicitud.entity.ts](../../../../src/modules/administrativas/solicitudes/entities/solicitud.entity.ts).
- [src/modules/auxiliares/estados/entities/estado.entity.ts](../../../../src/modules/auxiliares/estados/entities/estado.entity.ts).
- [src/modules/principales/estudiantes/entities/estudiante.entity.ts](../../../../src/modules/principales/estudiantes/entities/estudiante.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-SOL-002-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP SolicitudesController_reject`.
- **CA-SOL-002-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC SolicitudesController_reject`.
- **CA-SOL-002-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT rechazo persiste observaciones y es idempotente`, `INT rechazo conserva estado ante email ausente o SMTP fallido`, `INT rechazo no modifica solicitud si estado no esta configurado`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/administrativas/solicitudes/solicitudes.controller.ts](../../../../src/modules/administrativas/solicitudes/solicitudes.controller.ts).
- [src/modules/administrativas/solicitudes/solicitudes.service.ts](../../../../src/modules/administrativas/solicitudes/solicitudes.service.ts).
- [src/modules/administrativas/solicitudes/dto/reject-solicitud.dto.ts](../../../../src/modules/administrativas/solicitudes/dto/reject-solicitud.dto.ts).
