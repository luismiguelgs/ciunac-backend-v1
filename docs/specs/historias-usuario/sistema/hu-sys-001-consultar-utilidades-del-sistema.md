# HU-SYS-001: Consultar utilidades del sistema

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-SYS-001. Requisito: RF-SYS-001. Version: 1.0. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [sistema.md](../../sistema.md).

## Historia y objetivo

Como cliente del sistema, quiero consultar utilidades del sistema, para mantener los endpoints raiz actuales, incluido el perfil JWT y las utilidades historicas de token.

Mantener los endpoints raiz actuales, incluido el perfil JWT y las utilidades historicas de token.

## Actores y precondiciones

- Actor: cliente del sistema; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: publica; jwt. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `getHello`, `generarToken`, `validarToken` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `GET /` | `AppController_getHello` | Sin body | Publica  | 200 |
| `GET /profile` | `AppController_getProfile` | Sin body | jwt  | 200, 401 |
| `GET /login` | `AppController_login` | Query: user | Publica  | 200 |
| `GET /validar` | `AppController_validar` | Query: token | Publica  | 200 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- Sin entidad propia; el detalle de dependencias externas se encuentra en la especificacion del dominio.

## Criterios de aceptacion y evidencia

- **CA-SYS-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP AppController_getHello`, `HTTP AppController_getProfile`, `HTTP AppController_login`, `HTTP AppController_validar`.
- **CA-SYS-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC AppController_getHello`, `SEC AppController_getProfile`, `SEC AppController_login`, `SEC AppController_validar`.

Limite de evidencia: Contrato HTTP y guards enlazados; reglas particulares se describen en la spec. Escenarios adicionales de persistencia y frontend no se declaran verificados.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/app.controller.ts](../../../../src/app.controller.ts).
- [src/app.service.ts](../../../../src/app.service.ts).
