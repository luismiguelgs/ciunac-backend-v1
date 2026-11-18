# Inventario Verificable de Endpoints

Generado por `npm run docs:update` desde decoradores TypeScript y OpenAPI. Editar los controladores y las specs; no mantener rutas duplicadas a mano.

Modulos: **47**. Controladores: **48**. Operaciones: **249**.

Las rutas son relativas al backend. No existe prefijo global `/api/ciunac`; cualquier prefijo adicional pertenece al proxy o al cliente.

## administrativas

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/certificados` | api-key | Body CreateCertificadoDto | 201, 400, 401 | `CertificadosController_create` / CU-CER-002 |
| GET | `/certificados/aceptados` | api-key | Sin parametros | 200, 401 | `CertificadosController_findAceptados` / CU-CER-001 |
| GET | `/certificados` | api-key | Sin parametros | 200, 401 | `CertificadosController_findAll` / CU-CER-001 |
| GET | `/certificados/impresos` | api-key | Query impreso | 200, 401 | `CertificadosController_findByImpreso` / CU-CER-001 |
| GET | `/certificados/solicitud/:solicitudId` | api-key | Param solicitudId | 200, 401 | `CertificadosController_findBySolicitudId` / CU-CER-001 |
| GET | `/certificados/firmados` | api-key | Sin parametros | 200, 401 | `CertificadosController_findFirmados` / CU-CER-001 |
| GET | `/certificados/:id` | api-key | Param id | 200, 401 | `CertificadosController_findOne` / CU-CER-001 |
| GET | `/certificados/pendientes` | api-key | Sin parametros | 200, 401 | `CertificadosController_findPendientes` / CU-CER-001 |
| PATCH | `/certificados/procesar-firma` | api-key | Body ProcesarFirmaCertificadoDto | 200, 400, 401, 404, 500 | `CertificadosController_procesarFirma` / CU-CER-004 |
| POST | `/certificados/:id/archivo` | api-key | multipart/form-data; Param id; Body UploadCertificadoDto | 201, 400, 401, 404, 500 | `CertificadosController_subirArchivo` / CU-CER-003 |
| PATCH | `/certificados/:id` | api-key | Param id; Body UpdateCertificadoDto | 200, 400, 401 | `CertificadosController_update` / CU-CER-001 |
| POST | `/constancias` | api-key | Body CreateConstanciaDto | 201, 400, 401 | `ConstanciasController_create` / CU-CON-002 |
| GET | `/constancias` | api-key | Sin parametros | 200, 401 | `ConstanciasController_findAll` / CU-CON-001 |
| GET | `/constancias/aceptados` | api-key | Sin parametros | 200, 401 | `ConstanciasController_findByAceptado` / CU-CON-001 |
| GET | `/constancias/impresos` | api-key | Sin parametros | 200, 401 | `ConstanciasController_findByImpreso` / CU-CON-001 |
| GET | `/constancias/solicitud/:solicitudId` | api-key | Param solicitudId | 200, 401 | `ConstanciasController_findBySolicitudId` / CU-CON-001 |
| GET | `/constancias/:id` | api-key | Param id | 200, 401 | `ConstanciasController_findOne` / CU-CON-001 |
| GET | `/constancias/pendientes` | api-key | Sin parametros | 200, 401 | `ConstanciasController_findPendientes` / CU-CON-001 |
| PATCH | `/constancias/procesar-firma` | api-key | Body ProcesarFirmaDto | 200, 400, 401, 404, 500 | `ConstanciasController_procesarFirma` / CU-CON-003 |
| PATCH | `/constancias/:id` | api-key | Param id; Body UpdateConstanciaDto | 200, 400, 401 | `ConstanciasController_update` / CU-CON-001 |
| POST | `/pagos-banco` | api-key | Body CreatePagosBancoDto | 201, 400, 401 | `PagosBancoController_create` / CU-PAG-001 |
| GET | `/pagos-banco` | api-key | Query FilterPagosBancoDto | 200, 401 | `PagosBancoController_findAll` / CU-PAG-001 |
| GET | `/pagos-banco/:id` | api-key | Param id | 200, 401 | `PagosBancoController_findOne` / CU-PAG-001 |
| DELETE | `/pagos-banco/:id` | api-key | Param id | 200, 401 | `PagosBancoController_remove` / CU-PAG-001 |
| POST | `/pagos-banco/reverify` | api-key | Sin parametros | 201, 401, 500 | `PagosBancoController_reverify` / CU-PAG-003 |
| PATCH | `/pagos-banco/:id` | api-key | Param id; Body UpdatePagosBancoDto | 200, 400, 401 | `PagosBancoController_update` / CU-PAG-001 |
| POST | `/pagos-banco/upload` | api-key | multipart/form-data; Sin parametros | 201, 400, 401, 500 | `PagosBancoController_uploadFile` / CU-PAG-002 |
| POST | `/solicitudbecas` | api-key | Body CreateSolicitudbecaDto | 201, 400, 401 | `SolicitudbecasController_create` / CU-BEC-001 |
| GET | `/solicitudbecas` | api-key | Sin parametros | 200, 401 | `SolicitudbecasController_findAll` / CU-BEC-001 |
| GET | `/solicitudbecas/estado/:estado` | api-key | Param estado | 200, 401 | `SolicitudbecasController_findByEstado` / CU-BEC-001 |
| GET | `/solicitudbecas/:id` | api-key | Param id | 200, 401 | `SolicitudbecasController_findOne` / CU-BEC-001 |
| DELETE | `/solicitudbecas/:id` | api-key | Param id | 200, 401 | `SolicitudbecasController_remove` / CU-BEC-001 |
| PATCH | `/solicitudbecas/:id` | api-key | Param id; Body UpdateSolicitudbecaDto | 200, 400, 401 | `SolicitudbecasController_update` / CU-BEC-001 |
| POST | `/solicitudes` | api-key | Body CreateSolicitudDto | 201, 400, 401 | `SolicitudesController_create` / CU-SOL-001 |
| GET | `/solicitudes` | api-key | Sin parametros | 200, 401 | `SolicitudesController_findAll` / CU-SOL-001 |
| GET | `/solicitudes/documento/:numeroDocumento` | api-key | Param numeroDocumento | 200, 401 | `SolicitudesController_findByNumeroDocumento` / CU-SOL-001 |
| GET | `/solicitudes/:id` | api-key | Param id | 200, 401 | `SolicitudesController_findOne` / CU-SOL-001 |
| GET | `/solicitudes/certificados` | api-key | Query estado | 200, 401 | `SolicitudesController_getCertificadosPorEstado` / CU-SOL-001 |
| GET | `/solicitudes/constancias` | api-key | Query estado | 200, 401 | `SolicitudesController_getConstanciasPorEstado` / CU-SOL-001 |
| GET | `/solicitudes/examenes-ubicacion` | api-key | Query estado | 200, 401 | `SolicitudesController_getExamenesUbicacionPorEstado` / CU-SOL-001 |
| GET | `/solicitudes/reporte-fechas` | api-key | Query inicio; Query fin; Query tipo | 200, 401 | `SolicitudesController_getReportesPorFechas` / CU-SOL-001 |
| PATCH | `/solicitudes/:id/rechazo` | api-key | Param id; Body RejectSolicitudDto | 200, 400, 401, 404, 500 | `SolicitudesController_reject` / CU-SOL-002 |
| DELETE | `/solicitudes/:id` | api-key | Param id | 200, 401 | `SolicitudesController_remove` / CU-SOL-003 |
| PATCH | `/solicitudes/:id` | api-key | Param id; Body UpdateSolicitudDto | 200, 400, 401 | `SolicitudesController_update` / CU-SOL-001 |
| POST | `/tipossolicitud` | api-key | Body CreateTipossolicitudDto | 201, 400, 401 | `TipossolicitudController_create` / CU-TIP-001 |
| GET | `/tipossolicitud` | api-key | Sin parametros | 200, 401 | `TipossolicitudController_findAll` / CU-TIP-001 |
| GET | `/tipossolicitud/:id` | api-key | Param id | 200, 401 | `TipossolicitudController_findOne` / CU-TIP-001 |
| DELETE | `/tipossolicitud/:id` | api-key | Param id | 200, 401 | `TipossolicitudController_remove` / CU-TIP-001 |
| PATCH | `/tipossolicitud/:id` | api-key | Param id; Body UpdateTipossolicitudDto | 200, 400, 401 | `TipossolicitudController_update` / CU-TIP-001 |

## authentication

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/auth/forgot-password` | Publico | Body ForgotPasswordDto | 200, 400 | `AuthController_forgotPassword` / CU-AUTH-003 |
| GET | `/auth/profile` | api-key + jwt | Sin parametros | 200, 401 | `AuthController_getProfile` / CU-AUTH-006 |
| POST | `/auth/login` | Publico | Body LoginDto | 200, 400, 401 | `AuthController_login` / CU-AUTH-002 |
| POST | `/auth/logout` | api-key + jwt | Body userId | 201, 400, 401 | `AuthController_logout` / CU-AUTH-005 |
| POST | `/auth/register` | Publico | Body RegisterDto | 201, 400, 404, 409 | `AuthController_register` / CU-AUTH-001 |
| POST | `/auth/reset-password` | Publico | Body ResetPasswordDto | 200, 400 | `AuthController_resetPassword` / CU-AUTH-004 |
| POST | `/rol-permisos` | api-key + jwt; gestionar_usuarios | Body CreateRolPermisoDto | 201, 400, 401, 403 | `RolPermisosController_create` / CU-ROL-001 |
| GET | `/rol-permisos` | api-key + jwt | Sin parametros | 200, 401 | `RolPermisosController_findAll` / CU-ROL-001 |
| GET | `/rol-permisos/rol/:rol` | api-key + jwt | Param rol | 200, 401 | `RolPermisosController_findByRol` / CU-ROL-001 |
| GET | `/rol-permisos/:id` | api-key + jwt | Param id | 200, 401 | `RolPermisosController_findOne` / CU-ROL-001 |
| DELETE | `/rol-permisos/:id` | api-key + jwt; gestionar_usuarios | Param id | 200, 401, 403 | `RolPermisosController_remove` / CU-ROL-001 |
| PATCH | `/rol-permisos/:id` | api-key + jwt; gestionar_usuarios | Param id; Body UpdateRolPermisoDto | 200, 400, 401, 403 | `RolPermisosController_update` / CU-ROL-001 |
| POST | `/usuarios` | api-key + jwt; gestionar_usuarios | Body CreateUsuarioDto | 201, 400, 401, 403 | `UsuariosController_create` / CU-USR-001 |
| GET | `/usuarios` | api-key + jwt; gestionar_usuarios | Sin parametros | 200, 401, 403 | `UsuariosController_findAll` / CU-USR-001 |
| GET | `/usuarios/buscar/:email` | api-key + jwt | Param email | 200, 401 | `UsuariosController_findByEmail` / CU-USR-001 |
| GET | `/usuarios/:id` | api-key + jwt | Param id | 200, 401 | `UsuariosController_findOne` / CU-USR-001 |
| DELETE | `/usuarios/:id` | api-key + jwt; gestionar_usuarios | Param id | 200, 401, 403 | `UsuariosController_remove` / CU-USR-001 |
| PATCH | `/usuarios/:id` | api-key + jwt; gestionar_usuarios | Param id; Body UpdateUsuarioDto | 200, 400, 401, 403 | `UsuariosController_update` / CU-USR-001 |

## auxiliares

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/escuelas` | api-key | Body CreateEscuelaDto | 201, 400, 401 | `EscuelasController_create` / CU-ESC-001 |
| GET | `/escuelas` | api-key | Sin parametros | 200, 401 | `EscuelasController_findAll` / CU-ESC-001 |
| GET | `/escuelas/:id` | api-key | Param id | 200, 401 | `EscuelasController_findOne` / CU-ESC-001 |
| DELETE | `/escuelas/:id` | api-key | Param id | 200, 401 | `EscuelasController_remove` / CU-ESC-001 |
| PATCH | `/escuelas/:id` | api-key | Param id; Body UpdateEscuelaDto | 200, 400, 401 | `EscuelasController_update` / CU-ESC-001 |
| POST | `/estados` | api-key | Body CreateEstadoDto | 201, 400, 401 | `EstadosController_create` / CU-EDO-001 |
| GET | `/estados` | api-key | Sin parametros | 200, 401 | `EstadosController_findAll` / CU-EDO-001 |
| GET | `/estados/referencia/:referencia` | api-key | Param referencia | 200, 401 | `EstadosController_findByReferencia` / CU-EDO-001 |
| GET | `/estados/:id` | api-key | Param id | 200, 401 | `EstadosController_findOne` / CU-EDO-001 |
| DELETE | `/estados/:id` | api-key | Param id | 200, 401 | `EstadosController_remove` / CU-EDO-001 |
| PATCH | `/estados/:id` | api-key | Param id; Body UpdateEstadoDto | 200, 400, 401 | `EstadosController_update` / CU-EDO-001 |
| POST | `/facultades` | api-key | Body CreateFacultadeDto | 201, 400, 401 | `FacultadesController_create` / CU-FAC-001 |
| GET | `/facultades` | api-key | Sin parametros | 200, 401 | `FacultadesController_findAll` / CU-FAC-001 |
| GET | `/facultades/:id` | api-key | Param id | 200, 401 | `FacultadesController_findOne` / CU-FAC-001 |
| DELETE | `/facultades/:id` | api-key | Param id | 200, 401 | `FacultadesController_remove` / CU-FAC-001 |
| PATCH | `/facultades/:id` | api-key | Param id; Body UpdateFacultadeDto | 200, 400, 401 | `FacultadesController_update` / CU-FAC-001 |
| POST | `/textos` | api-key | Body CreateTextoDto | 201, 400, 401 | `TextosController_create` / CU-TXT-001 |
| GET | `/textos` | api-key | Sin parametros | 200, 401 | `TextosController_findAll` / CU-TXT-001 |
| GET | `/textos/:id` | api-key | Param id | 200, 401 | `TextosController_findOne` / CU-TXT-001 |
| DELETE | `/textos/:id` | api-key | Param id | 200, 401 | `TextosController_remove` / CU-TXT-001 |
| PATCH | `/textos/:id` | api-key | Param id; Body UpdateTextoDto | 200, 400, 401 | `TextosController_update` / CU-TXT-001 |

## calificaciones

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/actanotas` | api-key | Body CreateActaNotaDto | 201, 400, 401 | `ActanotasController_create` / CU-ACT-001 |
| GET | `/actanotas` | api-key | Sin parametros | 200, 401 | `ActanotasController_findAll` / CU-ACT-001 |
| GET | `/actanotas/:id` | api-key | Param id | 200, 401 | `ActanotasController_findOne` / CU-ACT-001 |
| PATCH | `/actanotas/:id` | api-key | Param id; Body UpdateActaNotaDto | 200, 400, 401 | `ActanotasController_update` / CU-ACT-001 |
| POST | `/evaluaciones` | api-key | Body CreateEvaluacioneDto | 201, 400, 401 | `EvaluacionesController_create` / CU-EVA-001 |
| GET | `/evaluaciones` | api-key | Sin parametros | 200, 401 | `EvaluacionesController_findAll` / CU-EVA-001 |
| GET | `/evaluaciones/:id` | api-key | Param id | 200, 401 | `EvaluacionesController_findOne` / CU-EVA-001 |
| DELETE | `/evaluaciones/:id` | api-key | Param id | 200, 401 | `EvaluacionesController_remove` / CU-EVA-001 |
| PATCH | `/evaluaciones/:id` | api-key | Param id; Body UpdateEvaluacioneDto | 200, 400, 401 | `EvaluacionesController_update` / CU-EVA-001 |
| POST | `/notas` | api-key | Body CreateNotaDto | 201, 400, 401 | `NotasController_create` / CU-NOT-001 |
| GET | `/notas` | api-key | Sin parametros | 200, 401 | `NotasController_findAll` / CU-NOT-001 |
| GET | `/notas/:id` | api-key | Param id | 200, 401 | `NotasController_findOne` / CU-NOT-001 |
| DELETE | `/notas/:id` | api-key | Param id | 200, 401 | `NotasController_remove` / CU-NOT-001 |
| PATCH | `/notas/:id` | api-key | Param id; Body UpdateNotaDto | 200, 400, 401 | `NotasController_update` / CU-NOT-001 |
| POST | `/notasfinal` | api-key | Body CreateNotasfinalDto | 201, 400, 401 | `NotasfinalController_create` / CU-NFI-001 |
| GET | `/notasfinal` | api-key | Sin parametros | 200, 401 | `NotasfinalController_findAll` / CU-NFI-001 |
| GET | `/notasfinal/:id` | api-key | Param id | 200, 401 | `NotasfinalController_findOne` / CU-NFI-001 |
| DELETE | `/notasfinal/:id` | api-key | Param id | 200, 401 | `NotasfinalController_remove` / CU-NFI-001 |
| PATCH | `/notasfinal/:id` | api-key | Param id; Body UpdateNotasfinalDto | 200, 400, 401 | `NotasfinalController_update` / CU-NFI-001 |

## estructura

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/aulas` | api-key | Body CreateAulaDto | 201, 400, 401 | `AulasController_create` / CU-AUL-001 |
| GET | `/aulas` | api-key | Sin parametros | 200, 401 | `AulasController_findAll` / CU-AUL-001 |
| GET | `/aulas/:id` | api-key | Param id | 200, 401 | `AulasController_findOne` / CU-AUL-001 |
| DELETE | `/aulas/:id` | api-key | Param id | 200, 401 | `AulasController_remove` / CU-AUL-001 |
| PATCH | `/aulas/:id` | api-key | Param id; Body UpdateAulaDto | 200, 400, 401 | `AulasController_update` / CU-AUL-001 |
| POST | `/ciclos` | api-key | Body CreateCicloDto | 201, 400, 401 | `CiclosController_create` / CU-CIC-001 |
| GET | `/ciclos` | api-key | Sin parametros | 200, 401 | `CiclosController_findAll` / CU-CIC-001 |
| GET | `/ciclos/:id` | api-key | Param id | 200, 401 | `CiclosController_findOne` / CU-CIC-001 |
| DELETE | `/ciclos/:id` | api-key | Param id | 200, 401 | `CiclosController_remove` / CU-CIC-001 |
| PATCH | `/ciclos/:id` | api-key | Param id; Body UpdateCicloDto | 200, 400, 401 | `CiclosController_update` / CU-CIC-001 |
| POST | `/grupos` | api-key | Body CreateGrupoDto | 201, 400, 401 | `GruposController_create` / CU-GRU-001 |
| GET | `/grupos` | api-key | Sin parametros | 200, 401 | `GruposController_findAll` / CU-GRU-001 |
| GET | `/grupos/:id` | api-key | Param id | 200, 401 | `GruposController_findOne` / CU-GRU-001 |
| DELETE | `/grupos/:id` | api-key | Param id | 200, 401 | `GruposController_remove` / CU-GRU-001 |
| PATCH | `/grupos/:id` | api-key | Param id; Body UpdateGrupoDto | 200, 400, 401 | `GruposController_update` / CU-GRU-001 |
| POST | `/idiomas` | api-key | Body CreateIdiomaDto | 201, 400, 401 | `IdiomasController_create` / CU-IDI-001 |
| GET | `/idiomas` | api-key | Sin parametros | 200, 401 | `IdiomasController_findAll` / CU-IDI-001 |
| GET | `/idiomas/:id` | api-key | Param id | 200, 401 | `IdiomasController_findOne` / CU-IDI-001 |
| DELETE | `/idiomas/:id` | api-key | Param id | 200, 401 | `IdiomasController_remove` / CU-IDI-001 |
| PATCH | `/idiomas/:id` | api-key | Param id; Body UpdateIdiomaDto | 200, 400, 401 | `IdiomasController_update` / CU-IDI-001 |
| POST | `/modulos` | api-key | Body CreateModuloDto | 201, 400, 401 | `ModulosController_create` / CU-MOD-001 |
| GET | `/modulos` | api-key | Sin parametros | 200, 401 | `ModulosController_findAll` / CU-MOD-001 |
| GET | `/modulos/visibles` | api-key | Sin parametros | 200, 401 | `ModulosController_findAllVisibles` / CU-MOD-001 |
| GET | `/modulos/:id` | api-key | Param id | 200, 401 | `ModulosController_findOne` / CU-MOD-001 |
| DELETE | `/modulos/:id` | api-key | Param id | 200, 401 | `ModulosController_remove` / CU-MOD-001 |
| PATCH | `/modulos/:id` | api-key | Param id; Body UpdateModuloDto | 200, 400, 401 | `ModulosController_update` / CU-MOD-001 |
| POST | `/niveles` | api-key | Body CreateNivelDto | 201, 400, 401 | `NivelesController_create` / CU-NIV-001 |
| GET | `/niveles` | api-key | Sin parametros | 200, 401 | `NivelesController_findAll` / CU-NIV-001 |
| GET | `/niveles/:id` | api-key | Param id | 200, 401 | `NivelesController_findOne` / CU-NIV-001 |
| DELETE | `/niveles/:id` | api-key | Param id | 200, 401 | `NivelesController_remove` / CU-NIV-001 |
| PATCH | `/niveles/:id` | api-key | Param id; Body UpdateNivelDto | 200, 400, 401 | `NivelesController_update` / CU-NIV-001 |

## examen_ubicacion

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/actasexamenubicacion` | api-key + jwt; gestionar_examen_ubicacion | Body CreateActasexamenubicacionDto | 201, 400, 401, 403, 404, 409, 500 | `ActasexamenubicacionController_create` / CU-EXU-007 |
| GET | `/actasexamenubicacion` | api-key | Sin parametros | 200, 401 | `ActasexamenubicacionController_findAll` / CU-EXU-008 |
| GET | `/actasexamenubicacion/:id` | api-key | Param id | 200, 400, 401, 404 | `ActasexamenubicacionController_findOne` / CU-EXU-008 |
| DELETE | `/actasexamenubicacion/:id` | api-key + jwt; gestionar_examen_ubicacion | Param id | 401, 403, 409 | `ActasexamenubicacionController_remove` / CU-EXU-007 |
| PATCH | `/actasexamenubicacion/:id` | api-key + jwt; gestionar_examen_ubicacion | Param id; Body UpdateActasexamenubicacionDto | 400, 401, 403, 409 | `ActasexamenubicacionController_update` / CU-EXU-007 |
| POST | `/calificacionesubicacion` | api-key | Body CreateCalificacionesubicacionDto | 201, 400, 401 | `CalificacionesubicacionController_create` / CU-EXU-001 |
| GET | `/calificacionesubicacion` | api-key | Sin parametros | 200, 401 | `CalificacionesubicacionController_findAll` / CU-EXU-001 |
| GET | `/calificacionesubicacion/:id` | api-key | Param id | 200, 401 | `CalificacionesubicacionController_findOne` / CU-EXU-001 |
| DELETE | `/calificacionesubicacion/:id` | api-key | Param id | 200, 401 | `CalificacionesubicacionController_remove` / CU-EXU-001 |
| PATCH | `/calificacionesubicacion/:id` | api-key | Param id; Body UpdateCalificacionesubicacionDto | 200, 400, 401 | `CalificacionesubicacionController_update` / CU-EXU-001 |
| POST | `/cronogramaubicacion` | api-key | Body CreateCronogramaubicacionDto | 201, 400, 401 | `CronogramaubicacionController_create` / CU-EXU-002 |
| GET | `/cronogramaubicacion` | api-key | Sin parametros | 200, 401 | `CronogramaubicacionController_findAll` / CU-EXU-002 |
| GET | `/cronogramaubicacion/:id` | api-key | Param id | 200, 401 | `CronogramaubicacionController_findOne` / CU-EXU-002 |
| DELETE | `/cronogramaubicacion/:id` | api-key | Param id | 200, 401 | `CronogramaubicacionController_remove` / CU-EXU-002 |
| PATCH | `/cronogramaubicacion/:id` | api-key | Param id; Body UpdateCronogramaubicacionDto | 200, 400, 401 | `CronogramaubicacionController_update` / CU-EXU-002 |
| POST | `/detallesubicacion` | api-key | Body CreateDetallesubicacionDto | 201, 400, 401 | `DetallesubicacionController_create` / CU-EXU-004 |
| GET | `/detallesubicacion` | api-key | Sin parametros | 200, 401 | `DetallesubicacionController_findAll` / CU-EXU-004 |
| GET | `/detallesubicacion/estudiante/documento/:documentNumber` | api-key | Param documentNumber | 200, 401 | `DetallesubicacionController_findByDocumentNumber` / CU-EXU-004 |
| GET | `/detallesubicacion/examen/:id` | api-key | Param id | 200, 401 | `DetallesubicacionController_findByExamen` / CU-EXU-004 |
| GET | `/detallesubicacion/:id` | api-key | Param id | 200, 401 | `DetallesubicacionController_findOne` / CU-EXU-004 |
| DELETE | `/detallesubicacion/:id` | api-key | Param id | 200, 401 | `DetallesubicacionController_remove` / CU-EXU-004 |
| PATCH | `/detallesubicacion/:id` | api-key | Param id; Body UpdateDetallesubicacionDto | 200, 400, 401 | `DetallesubicacionController_update` / CU-EXU-005 |
| POST | `/examenesubicacion` | api-key | Body CreateExamenesubicacionDto | 201, 400, 401 | `ExamenesubicacionController_create` / CU-EXU-003 |
| GET | `/examenesubicacion` | api-key | Sin parametros | 200, 401 | `ExamenesubicacionController_findAll` / CU-EXU-003 |
| GET | `/examenesubicacion/:id` | api-key | Param id | 200, 401 | `ExamenesubicacionController_findOne` / CU-EXU-003 |
| DELETE | `/examenesubicacion/:id` | api-key | Param id | 200, 401 | `ExamenesubicacionController_remove` / CU-EXU-003 |
| PATCH | `/examenesubicacion/:id` | api-key | Param id; Body UpdateExamenesubicacionDto | 200, 400, 401 | `ExamenesubicacionController_update` / CU-EXU-006 |

## principales

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/docentes` | api-key | Body CreateDocenteDto | 201, 400, 401 | `DocentesController_create` / CU-DOC-001 |
| GET | `/docentes/activos` | api-key | Sin parametros | 200, 401 | `DocentesController_findActive` / CU-DOC-001 |
| GET | `/docentes` | api-key | Sin parametros | 200, 401 | `DocentesController_findAll` / CU-DOC-001 |
| GET | `/docentes/usuario/:usuarioId` | api-key | Param usuarioId | 200, 401 | `DocentesController_findByUser` / CU-DOC-001 |
| GET | `/docentes/:id` | api-key | Param id | 200, 401 | `DocentesController_findOne` / CU-DOC-001 |
| DELETE | `/docentes/:id` | api-key | Param id | 200, 401 | `DocentesController_remove` / CU-DOC-001 |
| PATCH | `/docentes/:id` | api-key | Param id; Body UpdateDocenteDto | 200, 400, 401 | `DocentesController_update` / CU-DOC-001 |
| POST | `/estudiantes` | api-key | Body CreateEstudianteDto | 201, 400, 401 | `EstudiantesController_create` / CU-EST-001 |
| GET | `/estudiantes` | api-key | Sin parametros | 200, 401 | `EstudiantesController_findAll` / CU-EST-001 |
| GET | `/estudiantes/buscar/:dni` | api-key | Param dni | 200, 401 | `EstudiantesController_findByDni` / CU-EST-001 |
| GET | `/estudiantes/:id` | api-key | Param id | 200, 401 | `EstudiantesController_findOne` / CU-EST-001 |
| DELETE | `/estudiantes/:id` | api-key | Param id | 200, 401 | `EstudiantesController_remove` / CU-EST-001 |
| PATCH | `/estudiantes/:id` | api-key | Param id; Body UpdateEstudianteDto | 200, 400, 401 | `EstudiantesController_update` / CU-EST-001 |

## q10

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/q10/horarios-cursos` | api-key | Body Q10HorariosDto | 201, 400, 401 | `Q10Controller_guardarHorariosCursos` / CU-Q10-001 |
| GET | `/q10/horarios-cursos` | api-key | Query periodo | 200, 401 | `Q10Controller_listarHorariosCursos` / CU-Q10-001 |
| POST | `/q10/estudiantes` | api-key | Body Q10EstudianteDto | 201, 400, 401, 409, 413, 500, 502 | `Q10Controller_register` / CU-Q10-002 |

## seguimiento_docente

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| POST | `/academico-administrativo` | api-key | Body CreateAcademicoAdministrativoDto | 201, 400, 401 | `AcademicoAdministrativoController_create` / CU-ACA-001 |
| GET | `/academico-administrativo` | api-key | Sin parametros | 200, 401 | `AcademicoAdministrativoController_findAll` / CU-ACA-001 |
| GET | `/academico-administrativo/:id` | api-key | Param id | 200, 401 | `AcademicoAdministrativoController_findOne` / CU-ACA-001 |
| DELETE | `/academico-administrativo/:id` | api-key | Param id | 200, 401 | `AcademicoAdministrativoController_remove` / CU-ACA-001 |
| PATCH | `/academico-administrativo/:id` | api-key | Param id; Body UpdateAcademicoAdministrativoDto | 200, 400, 401 | `AcademicoAdministrativoController_update` / CU-ACA-001 |
| POST | `/cumplimiento-docente` | Publico | Body CreateCumplimientoDocenteDto | 201, 400 | `CumplimientoDocenteController_create` / CU-CUM-001 |
| GET | `/cumplimiento-docente` | Publico | Query moduloId; Query academicoAdministrativoId | 200 | `CumplimientoDocenteController_findAll` / CU-CUM-001 |
| GET | `/cumplimiento-docente/:id` | Publico | Param id | 200 | `CumplimientoDocenteController_findOne` / CU-CUM-001 |
| PATCH | `/cumplimiento-docente/:id` | Publico | Param id; Body UpdateCumplimientoDocenteDto | 200, 400 | `CumplimientoDocenteController_update` / CU-CUM-001 |
| GET | `/dashboard-docentes/cumplimiento` | Publico | Sin parametros | 200 | `DashboardDocentesController_getCumplimiento` / CU-DAS-001 |
| GET | `/dashboard-docentes/desempeno-general` | Publico | Sin parametros | 200 | `DashboardDocentesController_getDesempeñoGeneral` / CU-DAS-001 |
| GET | `/dashboard-docentes/gestion-metodologica` | Publico | Sin parametros | 200 | `DashboardDocentesController_getGestionMetodologica` / CU-DAS-001 |
| GET | `/dashboard-docentes/metricas-globales` | Publico | Sin parametros | 200 | `DashboardDocentesController_getMetricasGlobales` / CU-DAS-001 |
| GET | `/dashboard-docentes/perfil-profesional` | Publico | Sin parametros | 200 | `DashboardDocentesController_getPerfilProfesional` / CU-DAS-001 |
| GET | `/dashboard-docentes/ranking-docentes` | Publico | Sin parametros | 200 | `DashboardDocentesController_getRankingDocentes` / CU-DAS-002 |
| GET | `/dashboard-docentes/valoracion-estudiantil` | Publico | Sin parametros | 200 | `DashboardDocentesController_getValoracionEstudiantil` / CU-DAS-001 |
| POST | `/documentos-docente` | api-key | Body CreateDocumentosDocenteDto | 201, 400, 401 | `DocumentosDocenteController_create` / CU-DDO-001 |
| GET | `/documentos-docente` | api-key | Sin parametros | 200, 401 | `DocumentosDocenteController_findAll` / CU-DDO-001 |
| GET | `/documentos-docente/perfil/:perfilDocenteId` | api-key | Param perfilDocenteId | 200, 401 | `DocumentosDocenteController_findByPerfilDocenteId` / CU-DDO-001 |
| GET | `/documentos-docente/:id` | api-key | Param id | 200, 401 | `DocumentosDocenteController_findOne` / CU-DDO-001 |
| DELETE | `/documentos-docente/:id` | api-key | Param id | 200, 401 | `DocumentosDocenteController_remove` / CU-DDO-001 |
| PATCH | `/documentos-docente/:id` | api-key | Param id; Body UpdateDocumentosDocenteDto | 200, 400, 401 | `DocumentosDocenteController_update` / CU-DDO-001 |
| POST | `/encuesta-metricas-docente` | Publico | Body CreateEncuestaMetricasDocenteDto | 201, 400 | `EncuestaMetricasDocenteController_create` / CU-MET-001 |
| GET | `/encuesta-metricas-docente` | Publico | Query moduloId | 200 | `EncuestaMetricasDocenteController_findAll` / CU-MET-001 |
| GET | `/encuesta-metricas-docente/:id` | Publico | Param id | 200 | `EncuestaMetricasDocenteController_findOne` / CU-MET-001 |
| POST | `/encuesta-preguntas` | Publico | Body CreateEncuestaPreguntaDto | 201, 400 | `EncuestaPreguntasController_create` / CU-PRE-001 |
| GET | `/encuesta-preguntas` | Publico | Sin parametros | 200 | `EncuestaPreguntasController_findAll` / CU-PRE-001 |
| GET | `/encuesta-preguntas/:id` | Publico | Param id | 200 | `EncuestaPreguntasController_findOne` / CU-PRE-001 |
| DELETE | `/encuesta-preguntas/:id` | Publico | Param id | 200 | `EncuestaPreguntasController_remove` / CU-PRE-001 |
| PATCH | `/encuesta-preguntas/:id` | Publico | Param id; Body UpdateEncuestaPreguntaDto | 200, 400 | `EncuestaPreguntasController_update` / CU-PRE-001 |
| GET | `/encuesta-respuestas/buscar` | api-key | Query docenteId; Query moduloId | 200, 401 | `EncuestaRespuestasController_findByDocenteAndModulo` / CU-ENC-001 |
| POST | `/encuesta-respuestas/upload` | api-key | multipart/form-data; Sin parametros | 201, 400, 401 | `EncuestaRespuestasController_uploadFile` / CU-ENC-002 |
| POST | `/encuesta-respuestas-detalle` | Publico | Body CreateEncuestaRespuestasDetalleDto | 201, 400 | `EncuestaRespuestasDetalleController_create` / CU-END-001 |
| GET | `/encuesta-respuestas-detalle` | Publico | Sin parametros | 200 | `EncuestaRespuestasDetalleController_findAll` / CU-END-001 |
| GET | `/encuesta-respuestas-detalle/:id` | Publico | Param id | 200 | `EncuestaRespuestasDetalleController_findOne` / CU-END-001 |
| DELETE | `/encuesta-respuestas-detalle/:id` | Publico | Param id | 200 | `EncuestaRespuestasDetalleController_remove` / CU-END-001 |
| PATCH | `/encuesta-respuestas-detalle/:id` | Publico | Param id; Body UpdateEncuestaRespuestasDetalleDto | 200, 400 | `EncuestaRespuestasDetalleController_update` / CU-END-001 |
| POST | `/perfil-docente` | api-key | Body CreatePerfilDocenteDto | 201, 400, 401 | `PerfilDocenteController_create` / CU-PER-001 |
| GET | `/perfil-docente` | api-key | Sin parametros | 200, 401 | `PerfilDocenteController_findAll` / CU-PER-001 |
| GET | `/perfil-docente/:id` | api-key | Param id | 200, 401 | `PerfilDocenteController_findOne` / CU-PER-001 |
| DELETE | `/perfil-docente/:id` | api-key | Param id | 200, 401 | `PerfilDocenteController_remove` / CU-PER-001 |
| PATCH | `/perfil-docente/:id` | api-key | Param id; Body UpdatePerfilDocenteDto | 200, 400, 401 | `PerfilDocenteController_update` / CU-PER-001 |
| POST | `/perfil-docente-resultados` | Publico | Body CreatePerfilDocenteResultadoDto | 201, 400 | `PerfilDocenteResultadosController_create` / CU-RES-001 |
| GET | `/perfil-docente-resultados` | Publico | Sin parametros | 200 | `PerfilDocenteResultadosController_findAll` / CU-RES-001 |
| GET | `/perfil-docente-resultados/modulo/:moduloId` | Publico | Param moduloId | 200 | `PerfilDocenteResultadosController_findByModulo` / CU-RES-001 |
| GET | `/perfil-docente-resultados/:id` | Publico | Param id | 200 | `PerfilDocenteResultadosController_findOne` / CU-RES-001 |
| GET | `/perfil-docente-resultados/docente/:docenteId` | Publico | Param docenteId | 200 | `PerfilDocenteResultadosController_findResultadosByDocentePerfilId` / CU-RES-001 |
| POST | `/perfil-docente-resultados/generar` | Publico | Body { moduloId: number; docenteId: string } | 201, 400 | `PerfilDocenteResultadosController_generarResultado` / CU-RES-002 |
| GET | `/perfil-docente-resultados/detalle/:moduloId/:docenteId` | Publico | Param moduloId; Param docenteId | 200 | `PerfilDocenteResultadosController_getDetalleEvaluacion` / CU-RES-003 |
| PATCH | `/perfil-docente-resultados/:id` | Publico | Param id; Body UpdatePerfilDocenteResultadoDto | 200, 400 | `PerfilDocenteResultadosController_update` / CU-RES-001 |
| POST | `/puntaje-academico-administrativo` | Publico | Body CreatePuntajeAcademicoAdministrativoDto | 201, 400 | `PuntajeAcademicoAdministrativoController_create` / CU-PAA-001 |
| GET | `/puntaje-academico-administrativo` | Publico | Sin parametros | 200 | `PuntajeAcademicoAdministrativoController_findAll` / CU-PAA-001 |
| GET | `/puntaje-academico-administrativo/:id` | Publico | Param id | 200 | `PuntajeAcademicoAdministrativoController_findOne` / CU-PAA-001 |
| DELETE | `/puntaje-academico-administrativo/:id` | Publico | Param id | 200 | `PuntajeAcademicoAdministrativoController_remove` / CU-PAA-001 |
| PATCH | `/puntaje-academico-administrativo/:id` | Publico | Param id; Body UpdatePuntajeAcademicoAdministrativoDto | 200, 400 | `PuntajeAcademicoAdministrativoController_update` / CU-PAA-001 |
| POST | `/tipos-documento-perfil` | api-key | Body CreateTipoDocumentoPerfilDto | 201, 400, 401 | `TipoDocumentoPerfilController_create` / CU-TDP-001 |
| GET | `/tipos-documento-perfil` | api-key | Sin parametros | 200, 401 | `TipoDocumentoPerfilController_findAll` / CU-TDP-001 |
| GET | `/tipos-documento-perfil/:id` | api-key | Param id | 200, 401 | `TipoDocumentoPerfilController_findOne` / CU-TDP-001 |
| DELETE | `/tipos-documento-perfil/:id` | api-key | Param id | 200, 401 | `TipoDocumentoPerfilController_remove` / CU-TDP-001 |
| PATCH | `/tipos-documento-perfil/:id` | api-key | Param id; Body UpdateTipoDocumentoPerfilDto | 200, 400, 401 | `TipoDocumentoPerfilController_update` / CU-TDP-001 |

## shared

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| GET | `/certificadosr` | api-key | Sin parametros | 200, 401 | `CertificadosrController_findAll` / CU-RCE-001 |
| POST | `/mailer` | api-key | Body SendMailDto | 201, 400, 401, 500 | `MailerController_sendMail` / CU-MAI-001 |
| GET | `/tiempos` | api-key | Sin parametros | 200, 401 | `TiemposController_findAll` / CU-RTI-001 |
| POST | `/upload/:folder` | api-key | multipart/form-data; Param folder; Body nombre; Body fileId | 201, 400, 401 | `UploadController_uploadFile` / CU-UPL-001 |

## sistema

| Metodo | Ruta | Seguridad | Entrada | Respuesta HTTP | operationId / Caso |
| --- | --- | --- | --- | --- | --- |
| GET | `/` | Publico | Sin parametros | 200 | `AppController_getHello` / CU-SYS-001 |
| GET | `/profile` | jwt | Sin parametros | 200, 401 | `AppController_getProfile` / CU-SYS-001 |
| GET | `/login` | Publico | Query user | 200 | `AppController_login` / CU-SYS-001 |
| GET | `/validar` | Publico | Query token | 200 | `AppController_validar` / CU-SYS-001 |
