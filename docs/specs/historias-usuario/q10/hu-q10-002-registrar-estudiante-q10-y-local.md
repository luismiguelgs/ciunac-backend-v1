# HU-Q10-002: Registrar estudiante Q10 y local

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-Q10-002. Requisito: RF-Q10-002. Version: 1.1. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [q10.md](../../q10.md).

## Historia y objetivo

Como operador de integracion academica, quiero registrar estudiante q10 y local, para validar catalogos locales, crear en Q10, vincular Codigo_estudiante y registrar programa sin reintentos automaticos ante fallo parcial.

Validar catalogos locales, crear en Q10, vincular Codigo_estudiante y registrar programa sin reintentos automaticos ante fallo parcial.

## Actores y precondiciones

- Actor: operador de integracion academica; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `crearEstudianteEnQ10` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /q10/estudiantes` | `Q10Controller_register` | Body: Q10EstudianteDto | api-key  | 201, 400, 401, 409, 413, 500, 502 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/principales/estudiantes/entities/estudiante.entity.ts](../../../../src/modules/principales/estudiantes/entities/estudiante.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-Q10-002-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP Q10Controller_register`.
- **CA-Q10-002-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC Q10Controller_register`.
- **CA-Q10-002-03**: Los escenarios criticos AS-IS de persistencia y efectos externos indicados por las pruebas se conservan. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT Q10 sincroniza id local y conserva codigo ante matricula fallida`, `INT SQL id_q10 es repetible permite nulos e impide duplicados`.
- **CA-Q10-002-04**: HU-EST-002: tipo y documento opcionales solo locales, compatibilidad PRE/POS y PG con relaciones opcionales, sin campos locales en Q10. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT estudiante nuevo persiste tipo documento y valida escuelas sin enviar campos locales a Q10`.
- **CA-Q10-002-05**: El request minimo, campos locales null, ejemplos y los codigos 502 coinciden con Swagger y la validacion HTTP. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SWAGGER Q10 campos opcionales y nulos coinciden con HTTP`, `SWAGGER ejemplos de alumno nuevo validan contra su requestBody`, `SWAGGER error 502 documenta Q10_UNAVAILABLE`, `SWAGGER error 502 documenta Q10_PERIOD_LOOKUP_FAILED`, `SWAGGER error 502 documenta Q10_CREATED_LOCAL_SYNC_FAILED`, `SWAGGER error 502 documenta Q10_CREATED_PROGRAM_PENDING`, `SWAGGER error 502 documenta Q10_CREATED_INVALID_RESPONSE`.
- **CA-Q10-002-06**: Los rechazos incluyen operacion, etapa y reglas seguras; JSON malformado y errores inesperados se registran sin datos personales. Evidencia: [test/q10-estudiantes.e2e-spec.ts](../../../../test/q10-estudiantes.e2e-spec.ts), `logs safe validation rules and correlates the response without field values`, `logs malformed JSON before the controller and does not expose parser messages`, `logs unexpected failures once, without exception contents or invalid correlation`.

Limite de evidencia: Contrato HTTP y escenarios criticos de negocio enlazados; no acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/q10/q10.controller.ts](../../../../src/q10/q10.controller.ts).
- [src/q10/q10.service.ts](../../../../src/q10/q10.service.ts).
- [src/q10/dto/q10-estudiante.dto.ts](../../../../src/q10/dto/q10-estudiante.dto.ts).
