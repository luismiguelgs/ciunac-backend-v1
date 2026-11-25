# HU-EST-001: Gestionar estudiantes

<!-- Generado desde flows.json. Mantener la narracion de negocio en el spec enlazado. -->

## Identificacion y estado

- Caso: CU-EST-001. Requisito: RF-EST-001. Version: 1.1. Responsable: Equipo tecnico CIUNAC.
- Estado: Implementado (AS-IS). La verificacion se acredita exclusivamente en el reporte de `npm run sdd:check`.
- Especificacion: [principales.md](../../principales.md).

## Historia y objetivo

Como operador academico, quiero gestionar estudiantes, para mantener la identidad local y consultar estudiantes por UUID o documento sin editar idQ10.

Mantener la identidad local y consultar estudiantes por UUID o documento sin editar idQ10.

## Actores y precondiciones

- Actor: operador academico; frontend CIUNAC como cliente HTTP.
- Persistencia y catalogos relacionados disponibles cuando el servicio los utiliza.
- Autenticacion: api-key. Los permisos por operacion se detallan en la tabla.

## Flujo principal

1. El frontend recoge los datos del proceso y aplica las validaciones de presentacion.
2. Invoca una de las operaciones del contrato siguiente; el backend aplica sus guards, pipes e interceptores reales.
3. Ejecuta `create`, `findAll`, `findByDni`, `findOne`, `remove`, `update` y devuelve el resultado actual.
4. El frontend interpreta el codigo y body documentados, actualiza la vista y evita duplicar acciones con efectos externos.

## Contratos API

| Metodo / Ruta | operationId | Entrada | Seguridad / permiso | Respuestas |
| --- | --- | --- | --- | --- |
| `POST /estudiantes` | `EstudiantesController_create` | Body: CreateEstudianteDto | api-key  | 201, 400, 401 |
| `GET /estudiantes` | `EstudiantesController_findAll` | Query: ListarEstudiantesDto | api-key  | 200, 400, 401 |
| `GET /estudiantes/buscar/:dni` | `EstudiantesController_findByDni` | Param: dni | api-key  | 200, 401 |
| `GET /estudiantes/:id` | `EstudiantesController_findOne` | Param: id | api-key  | 200, 401 |
| `DELETE /estudiantes/:id` | `EstudiantesController_remove` | Param: id | api-key  | 200, 401 |
| `PATCH /estudiantes/:id` | `EstudiantesController_update` | Param: id; Body: UpdateEstudianteDto | api-key  | 200, 400, 401 |

Los schemas completos y tipos opcionales/nulos estan en [OpenAPI](../../../api/openapi.json).

## Alternativas, errores y reglas

- API key/JWT ausente o invalido devuelve 401 cuando el guard correspondiente existe. Un permiso denegado devuelve 403 cuando se exige.
- Las validaciones de DTO existentes producen 400; un tipo inline no implica validacion de negocio.
- No se presupone 404: algunos CRUD actuales devuelven 200 con null o respuesta vacia para recursos inexistentes. Verificar el spec y el servicio asociado.
- Los efectos, errores de integracion, estados y limitaciones particulares estan definidos en la especificacion del dominio.
- Las propuestas no implementadas se mantienen en [Backlog](../../backlog.md).

## Datos e integraciones

- [src/modules/principales/estudiantes/entities/estudiante.entity.ts](../../../../src/modules/principales/estudiantes/entities/estudiante.entity.ts).
- [src/modules/auxiliares/facultades/entities/facultad.entity.ts](../../../../src/modules/auxiliares/facultades/entities/facultad.entity.ts).
- [src/modules/auxiliares/escuelas/entities/escuela.entity.ts](../../../../src/modules/auxiliares/escuelas/entities/escuela.entity.ts).

## Criterios de aceptacion y evidencia

- **CA-EST-001-01**: La operacion HTTP acepta el contrato documentado y devuelve el codigo y estructura definidos por el controlador actual. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `HTTP EstudiantesController_create`, `HTTP EstudiantesController_findAll`, `HTTP EstudiantesController_findByDni`, `HTTP EstudiantesController_findOne`, `HTTP EstudiantesController_remove`, `HTTP EstudiantesController_update`.
- **CA-EST-001-02**: Los guards y permisos realmente declarados se aplican antes de invocar el servicio; las rutas publicas se identifican explicitamente. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `SEC EstudiantesController_create`, `SEC EstudiantesController_findAll`, `SEC EstudiantesController_findByDni`, `SEC EstudiantesController_findOne`, `SEC EstudiantesController_remove`, `SEC EstudiantesController_update`.
- **CA-EST-001-03**: fechaNacimiento valida YYYY-MM-DD llega como texto al servicio; fechas imposibles, null y ausencia al crear se rechazan antes de persistir. BL-VAL-001 corregido. Evidencia: [test/sdd/contracts.contract-spec.cjs](../../../../test/sdd/contracts.contract-spec.cjs), `REG EST fecha calendario valida llega como texto al servicio en POST y PATCH`, `REG EST fecha invalida nula o ausente no llega a persistencia`, `SWAGGER fecha obligatoria solo al crear y con formato date`, `SWAGGER tipos nulos permitidos coinciden con POST y PATCH locales`.
- **CA-EST-001-04**: El alta y PATCH locales conservan fechas calendario en PostgreSQL, tambien en UTC y America/Lima, sin alterar las relaciones ni los campos locales existentes. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT estudiante local valida POST PATCH y persiste fecha calendario por HTTP`, `INT fecha estudiante no cambia de dia en UTC ni America Lima`.
- **CA-EST-001-05**: El listado aplica busqueda, filtros y paginacion en PostgreSQL, devuelve totales y excluye credenciales y el documento adjunto. Evidencia: [test/sdd/critical.integration-spec.cjs](../../../../test/sdd/critical.integration-spec.cjs), `INT estudiantes pagina filtra y proyecta el listado por HTTP`.

Limite de evidencia: Contratos HTTP, validacion de fecha calendario y persistencia local enlazados. No acredita todas las ramas ni la interfaz frontend.

## Responsabilidades frontend/backend

- Frontend: enviar los nombres, tipos y contenido del contrato; manejar estados de carga, confirmacion y error del proceso.
- Backend: ejecutar las validaciones, permisos, consultas y persistencia implementadas. La UI no reemplaza estos controles.
- La guia frontend es un contrato de integracion; no acredita la implementacion visual del frontend.

## Trazabilidad tecnica

- [src/modules/principales/estudiantes/estudiantes.controller.ts](../../../../src/modules/principales/estudiantes/estudiantes.controller.ts).
- [src/modules/principales/estudiantes/estudiantes.service.ts](../../../../src/modules/principales/estudiantes/estudiantes.service.ts).
- [src/modules/principales/estudiantes/dto/create-estudiante.dto.ts](../../../../src/modules/principales/estudiantes/dto/create-estudiante.dto.ts).
- [src/modules/principales/estudiantes/dto/listar-estudiantes.dto.ts](../../../../src/modules/principales/estudiantes/dto/listar-estudiantes.dto.ts).
- [src/modules/principales/estudiantes/dto/update-estudiante.dto.ts](../../../../src/modules/principales/estudiantes/dto/update-estudiante.dto.ts).
