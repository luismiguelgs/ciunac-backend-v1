# Mapa de Dominios y Modulos

## Resumen

El sistema se organiza por dominios bajo `src/modules`, mas integraciones en `src/q10` y servicios compartidos en `src/shared`. Los nombres de carpeta principales son `administrativas`, `authentication`, `auxiliares`, `calificaciones`, `estructura`, `examen_ubicacion`, `principales`, `seguimiento_docente`, `q10` y `shared`.

| Dominio | Modulos | Proposito |
| --- | --- | --- |
| Administrativas | `solicitudes`, `constancias`, `certificados`, `solicitudbecas`, `pagos-banco`, `tipossolicitud` | Tramites, documentos, pagos y clasificacion de solicitudes. |
| Authentication | `auth`, `usuarios`, `rol_permisos` | Login, registro, recuperacion de contrasena, perfil, roles y permisos. |
| Auxiliares | `escuelas`, `facultades`, `estados`, `textos` | Catalogos y contenido auxiliar. |
| Calificaciones | `evaluaciones`, `notas`, `notasfinal`, `actanotas` | Registro academico de evaluaciones, notas y actas. |
| Estructura | `idiomas`, `niveles`, `ciclos`, `modulos`, `grupos`, `aulas` | Organizacion academica y operativa. |
| Examen ubicacion | `examenesubicacion`, `detallesubicacion`, `calificacionesubicacion`, `cronogramaubicacion`, `actasexamenubicacion` | Flujo de examenes de ubicacion y resultados. |
| Principales | `estudiantes`, `docentes` | Actores academicos base. |
| Seguimiento docente | `perfil_docente`, `tipo_documento_perfil`, `documentos_docente`, `academico_administrativo`, `puntaje_academico_administrativo`, `cumplimiento_docente`, `encuesta_preguntas`, `encuesta_respuestas`, `encuesta_respuestas_detalle`, `encuesta_metricas_docente`, `perfil_docente_resultados`, `dashboard_docentes` | Evaluacion, documentacion, metricas y dashboard docente. |
| Integracion Q10 | `q10` | Sincronizacion con sistema academico externo. |
| Shared | `upload`, `mailer`, `reportes/certificadosr`, `reportes/tiempos` | Archivos Drive, correo y reportes de certificados/tiempos. |

## Dominios core

### Administrativas

Gestiona solicitudes generales y documentos derivados. Incluye endpoints para consultar por estado, tipo, documento, fechas, pendientes, impresos y aceptados. `pagos-banco` procesa CSVs y reverifica pagos.

### Authentication

Gestiona usuarios locales u OAuth, login JWT, logout, perfil autenticado y permisos por rol. Los controllers de `usuarios` y `rol-permisos` usan `ApiKeyGuard`, JWT y `PermissionsGuard`.

### Seguimiento docente

Agrupa los procesos de perfil docente, documentos requeridos, cumplimiento, encuestas, metricas, generacion de resultados y dashboard. Algunos endpoints de dashboard y metricas deben revisarse por exposicion de guards.

### Examen ubicacion

Gestiona examenes, cronogramas, detalles por examen o documento, calificaciones y actas. Combina entidades TypeORM con schemas Mongoose para actas.

## Integraciones transversales

- `UploadModule`: subida y movimiento de archivos en Google Drive.
- `MailerModule`: envio de correos por tipo.
- `Q10Module`: horarios, cursos y creacion de estudiantes en Q10.

## Cobertura completa

El [inventario de modulos](module-inventory.md) enumera automaticamente cada clase @Module y su archivo, incluidos los reportes. La [matriz SDD](../specs/traceability.json) relaciona esos modulos con specs y operaciones. No se mantienen conteos fijos que puedan ocultar modulos nuevos.
