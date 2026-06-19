# Inventario Inicial de Endpoints

Este inventario se genero desde los controllers actuales. Los DTOs y respuestas se deben completar progresivamente al incorporar OpenAPI.

Convenciones:

- `ApiKey`: requiere header `x-api-key`.
- `JWT`: requiere Bearer token.
- `Permisos`: requiere `PermissionsGuard` y decoradores de permiso.
- `Sin guard visible`: no se observo `@UseGuards` en el controller o metodo durante el inventario.

## Trazabilidad de controller files

| Dominio | Controller files |
| --- | --- |
| Root | `app` |
| Administrativas | `certificados`, `constancias`, `pagos-banco`, `solicitudbecas`, `solicitudes`, `tipossolicitud` |
| Authentication | `auth`, `rol_permisos`, `usuarios` |
| Auxiliares | `escuelas`, `estados`, `facultades`, `textos` |
| Calificaciones | `actanotas`, `evaluaciones`, `notas`, `notasfinal` |
| Estructura | `aulas`, `ciclos`, `grupos`, `idiomas`, `modulos`, `niveles` |
| Examen ubicacion | `actasexamenubicacion`, `calificacionesubicacion`, `cronogramaubicacion`, `detallesubicacion`, `examenesubicacion` |
| Principales | `docentes`, `estudiantes` |
| Seguimiento docente | `academico_administrativo`, `cumplimiento_docente`, `dashboard_docentes`, `documentos_docente`, `encuesta_metricas_docente`, `encuesta_preguntas`, `encuesta_respuestas`, `encuesta_respuestas_detalle`, `perfil_docente`, `perfil_docente_resultados`, `puntaje_academico_administrativo`, `tipo_documento_perfil` |
| Integraciones | `q10`, `mailer`, `upload` |

## App

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `app.controller.ts` | JWT solo en `profile` | `GET /`, `GET /login`, `GET /validar`, `GET /profile` |

## Administrativas

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `certificados` | ApiKey; JWT en delete | `POST /certificados`, `GET /certificados`, `GET /certificados/solicitud/:solicitudId`, `GET /certificados/impresos`, `GET /certificados/:id`, `PATCH /certificados/:id`, `DELETE /certificados/:id` |
| `constancias` | ApiKey; JWT en delete | `POST /constancias`, `GET /constancias`, `GET /constancias/pendientes`, `GET /constancias/impresos`, `GET /constancias/aceptados`, `PATCH /constancias/procesar-firma`, `GET /constancias/:id`, `PATCH /constancias/:id`, `DELETE /constancias/:id` |
| `pagos-banco` | ApiKey | `POST /pagos-banco/upload`, `POST /pagos-banco/reverify`, `POST /pagos-banco`, `GET /pagos-banco`, `GET /pagos-banco/:id`, `PATCH /pagos-banco/:id`, `DELETE /pagos-banco/:id` |
| `solicitudbecas` | ApiKey | `POST /solicitudbecas`, `GET /solicitudbecas`, `GET /solicitudbecas/estado/:estado`, `GET /solicitudbecas/:id`, `PATCH /solicitudbecas/:id`, `DELETE /solicitudbecas/:id` |
| `solicitudes` | ApiKey | `POST /solicitudes`, `GET /solicitudes`, `GET /solicitudes/certificados`, `GET /solicitudes/constancias`, `GET /solicitudes/examenes-ubicacion`, `GET /solicitudes/documento/:numeroDocumento`, `GET /solicitudes/reporte-fechas`, `GET /solicitudes/:id`, `PATCH /solicitudes/:id`, `DELETE /solicitudes/:id` |
| `tipossolicitud` | ApiKey | `POST /tipossolicitud`, `GET /tipossolicitud`, `GET /tipossolicitud/:id`, `PATCH /tipossolicitud/:id`, `DELETE /tipossolicitud/:id` |

## Authentication

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `auth` | Publico para register/login/logout; JWT + ApiKey en profile | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/profile` |
| `usuarios` | ApiKey + JWT + Permisos | `POST /usuarios`, `GET /usuarios`, `GET /usuarios/:id`, `PATCH /usuarios/:id`, `GET /usuarios/buscar/:email`, `DELETE /usuarios/:id` |
| `rol-permisos` | ApiKey + JWT + Permisos | `POST /rol-permisos`, `GET /rol-permisos`, `GET /rol-permisos/rol/:rol`, `GET /rol-permisos/:id`, `PATCH /rol-permisos/:id`, `DELETE /rol-permisos/:id` |

## Auxiliares

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `escuelas` | ApiKey | `POST /escuelas`, `GET /escuelas`, `GET /escuelas/:id`, `PATCH /escuelas/:id`, `DELETE /escuelas/:id` |
| `estados` | ApiKey | `POST /estados`, `GET /estados`, `GET /estados/referencia/:referencia`, `GET /estados/:id`, `PATCH /estados/:id`, `DELETE /estados/:id` |
| `facultades` | ApiKey | `POST /facultades`, `GET /facultades`, `GET /facultades/:id`, `PATCH /facultades/:id`, `DELETE /facultades/:id` |
| `textos` | ApiKey | `POST /textos`, `GET /textos`, `GET /textos/:id`, `PATCH /textos/:id`, `DELETE /textos/:id` |

## Calificaciones

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `actanotas` | ApiKey; JWT en delete | `POST /actanotas`, `GET /actanotas`, `GET /actanotas/:id`, `PATCH /actanotas/:id`, `DELETE /actanotas/:id` |
| `evaluaciones` | ApiKey | `POST /evaluaciones`, `GET /evaluaciones`, `GET /evaluaciones/:id`, `PATCH /evaluaciones/:id`, `DELETE /evaluaciones/:id` |
| `notas` | ApiKey | `POST /notas`, `GET /notas`, `GET /notas/:id`, `PATCH /notas/:id`, `DELETE /notas/:id` |
| `notasfinal` | ApiKey | `POST /notasfinal`, `GET /notasfinal`, `GET /notasfinal/:id`, `PATCH /notasfinal/:id`, `DELETE /notasfinal/:id` |

## Estructura

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `aulas` | ApiKey | `POST /aulas`, `GET /aulas`, `GET /aulas/:id`, `PATCH /aulas/:id`, `DELETE /aulas/:id` |
| `ciclos` | ApiKey | `POST /ciclos`, `GET /ciclos`, `GET /ciclos/:id`, `PATCH /ciclos/:id`, `DELETE /ciclos/:id` |
| `grupos` | ApiKey | `POST /grupos`, `GET /grupos`, `GET /grupos/:id`, `PATCH /grupos/:id`, `DELETE /grupos/:id` |
| `idiomas` | ApiKey | `POST /idiomas`, `GET /idiomas`, `GET /idiomas/:id`, `PATCH /idiomas/:id`, `DELETE /idiomas/:id` |
| `modulos` | ApiKey | `POST /modulos`, `GET /modulos`, `GET /modulos/visibles`, `GET /modulos/:id`, `PATCH /modulos/:id`, `DELETE /modulos/:id` |
| `niveles` | ApiKey | `POST /niveles`, `GET /niveles`, `GET /niveles/:id`, `PATCH /niveles/:id`, `DELETE /niveles/:id` |

## Examen ubicacion

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `actasexamenubicacion` | ApiKey | `POST /actasexamenubicacion`, `GET /actasexamenubicacion`, `GET /actasexamenubicacion/:id`, `PATCH /actasexamenubicacion/:id`, `DELETE /actasexamenubicacion/:id` |
| `calificacionesubicacion` | ApiKey | `POST /calificacionesubicacion`, `GET /calificacionesubicacion`, `GET /calificacionesubicacion/:id`, `PATCH /calificacionesubicacion/:id`, `DELETE /calificacionesubicacion/:id` |
| `cronogramaubicacion` | ApiKey | `POST /cronogramaubicacion`, `GET /cronogramaubicacion`, `GET /cronogramaubicacion/:id`, `PATCH /cronogramaubicacion/:id`, `DELETE /cronogramaubicacion/:id` |
| `detallesubicacion` | ApiKey | `POST /detallesubicacion`, `GET /detallesubicacion`, `GET /detallesubicacion/examen/:id`, `GET /detallesubicacion/estudiante/documento/:documentNumber`, `GET /detallesubicacion/:id`, `PATCH /detallesubicacion/:id`, `DELETE /detallesubicacion/:id` |
| `examenesubicacion` | ApiKey | `POST /examenesubicacion`, `GET /examenesubicacion`, `GET /examenesubicacion/:id`, `PATCH /examenesubicacion/:id`, `DELETE /examenesubicacion/:id` |

## Principales

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `docentes` | ApiKey | `POST /docentes`, `GET /docentes`, `GET /docentes/activos`, `GET /docentes/usuario/:usuarioId`, `GET /docentes/:id`, `PATCH /docentes/:id`, `DELETE /docentes/:id` |
| `estudiantes` | ApiKey | `POST /estudiantes`, `GET /estudiantes`, `GET /estudiantes/:id`, `GET /estudiantes/buscar/:dni`, `PATCH /estudiantes/:id`, `DELETE /estudiantes/:id` |

## Seguimiento docente

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `academico-administrativo` | ApiKey | `POST /academico-administrativo`, `GET /academico-administrativo`, `GET /academico-administrativo/:id`, `PATCH /academico-administrativo/:id`, `DELETE /academico-administrativo/:id` |
| `cumplimiento-docente` | Sin guard visible | `POST /cumplimiento-docente`, `GET /cumplimiento-docente`, `GET /cumplimiento-docente/:id`, `PATCH /cumplimiento-docente/:id` |
| `dashboard-docentes` | Sin guard visible | `GET /dashboard-docentes/metricas-globales`, `GET /dashboard-docentes/desempeno-general`, `GET /dashboard-docentes/ranking-docentes`, `GET /dashboard-docentes/perfil-profesional`, `GET /dashboard-docentes/cumplimiento`, `GET /dashboard-docentes/gestion-metodologica`, `GET /dashboard-docentes/valoracion-estudiantil` |
| `documentos-docente` | ApiKey | `POST /documentos-docente`, `GET /documentos-docente`, `GET /documentos-docente/perfil/:perfilDocenteId`, `GET /documentos-docente/:id`, `PATCH /documentos-docente/:id`, `DELETE /documentos-docente/:id` |
| `encuesta-metricas-docente` | Sin guard visible | `POST /encuesta-metricas-docente`, `GET /encuesta-metricas-docente`, `GET /encuesta-metricas-docente/:id` |
| `encuesta-preguntas` | Sin guard visible | `POST /encuesta-preguntas`, `GET /encuesta-preguntas`, `GET /encuesta-preguntas/:id`, `PATCH /encuesta-preguntas/:id`, `DELETE /encuesta-preguntas/:id` |
| `encuesta-respuestas` | ApiKey | `POST /encuesta-respuestas/upload`, `GET /encuesta-respuestas/buscar` |
| `encuesta-respuestas-detalle` | Sin guard visible | `POST /encuesta-respuestas-detalle`, `GET /encuesta-respuestas-detalle`, `GET /encuesta-respuestas-detalle/:id`, `PATCH /encuesta-respuestas-detalle/:id`, `DELETE /encuesta-respuestas-detalle/:id` |
| `perfil-docente` | ApiKey | `POST /perfil-docente`, `GET /perfil-docente`, `GET /perfil-docente/:id`, `PATCH /perfil-docente/:id`, `DELETE /perfil-docente/:id` |
| `perfil-docente-resultados` | Sin guard visible | `POST /perfil-docente-resultados/generar`, `GET /perfil-docente-resultados/modulo/:moduloId`, `POST /perfil-docente-resultados`, `GET /perfil-docente-resultados`, `GET /perfil-docente-resultados/docente/:docenteId`, `GET /perfil-docente-resultados/detalle/:moduloId/:docenteId`, `GET /perfil-docente-resultados/:id`, `PATCH /perfil-docente-resultados/:id` |
| `puntaje-academico-administrativo` | Sin guard visible | `POST /puntaje-academico-administrativo`, `GET /puntaje-academico-administrativo`, `GET /puntaje-academico-administrativo/:id`, `PATCH /puntaje-academico-administrativo/:id`, `DELETE /puntaje-academico-administrativo/:id` |
| `tipos-documento-perfil` | ApiKey | `POST /tipos-documento-perfil`, `GET /tipos-documento-perfil`, `GET /tipos-documento-perfil/:id`, `PATCH /tipos-documento-perfil/:id`, `DELETE /tipos-documento-perfil/:id` |

## Integraciones y shared

| Controller | Auth | Endpoints |
| --- | --- | --- |
| `q10` | ApiKey | `POST /q10/estudiantes`, `GET /q10/horarios-cursos`, `POST /q10/horarios-cursos` |
| `mailer` | ApiKey | `POST /mailer` |
| `upload` | ApiKey | `POST /upload/:folder` |
