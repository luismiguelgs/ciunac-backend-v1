# Documentacion CIUNAC Backend

Esta carpeta contiene la documentacion versionada del backend CIUNAC. Esta pensada para dos audiencias: negocio, que necesita entender procesos y responsabilidades, y equipo tecnico, que necesita arquitectura, contratos, trazabilidad y criterios de prueba.

## Como leer esta documentacion

- Para una vista general del sistema, empezar por [Arquitectura general](architecture/overview.md).
- Para entender dominios y modulos NestJS, leer [Mapa de modulos](architecture/modules.md).
- Para revisar seguridad, variables sensibles y riesgos, leer [Seguridad](architecture/security.md).
- Para revisar persistencia, leer [Datos y persistencia](architecture/data.md).
- Para implementar o validar endpoints, usar [Inventario API](api/endpoints.md) y [Swagger / OpenAPI](api/openapi.md).
- Para trabajar con spec-driven development, usar [Workflow SDD](specs/workflow.md), [Plantilla](specs/spec-template.md), [Historias y casos de uso](specs/use-cases-index.md) y [Matriz verificable](specs/traceability.json).
- Para integrar pantallas, usar [Guia frontend por flujo](frontend/integration.md).
- Para implementar estudiantes y alumno nuevo en `ciunac-admin-2`, usar [Flujo y contratos administrativos](frontend/ciunac-admin-2-estudiantes.md).
- Para pruebas, usar [Estrategia de testing](testing/strategy.md).
- Para operacion y configuracion, usar [Configuracion operacional](operations/configuration.md).

## Estado inicial

Las specs describen el comportamiento actual (AS-IS). Las propuestas y limitaciones estan en [backlog](specs/backlog.md). Los conteos se descubren desde codigo y se publican en el inventario API, la matriz y el [inventario de modulos](architecture/module-inventory.md).

El [registro de reconciliacion](specs/reconciliation.md) identifica las operaciones omitidas/obsoletas y las contradicciones corregidas, sin modificar reglas de negocio.

Ciclo: Borrador -> Especificado -> Implementado -> Verificado. Solo una ejecucion aprobada de npm run sdd:check acredita Verificado mediante artifacts/sdd/verification.json con pruebas, fecha y commit. Cobertura documental no equivale a ausencia de defectos ni a cobertura total de ramas.

La documentacion refleja el estado actual del codigo fuente bajo `src/`:

- Monolito modular NestJS v11.
- PostgreSQL con TypeORM para datos transaccionales.
- MongoDB con Mongoose para documentos, textos y actas.
- Autenticacion JWT, API key y permisos por rol.
- Integraciones con Q10, Google Drive, SMTP y cargas CSV.

## Documentos principales

| Area | Documento |
| --- | --- |
| Arquitectura | [Overview](architecture/overview.md), [Contexto](architecture/context.md), [Contenedores](architecture/containers.md), [Modulos](architecture/modules.md) |
| Seguridad | [Security](architecture/security.md) |
| Datos | [Data](architecture/data.md) |
| Integraciones | [Integrations](architecture/integrations.md) |
| API | [Endpoints](api/endpoints.md), [OpenAPI](api/openapi.md) |
| Specs | [Template](specs/spec-template.md), [Use cases](specs/use-cases-index.md), [Exámenes de ubicación](specs/examen-ubicacion.md), [Implementación de actas](specs/implementacion-actas-examen-ubicacion.md) |
| Operacion | [Configuration](operations/configuration.md) |
| Testing | [Strategy](testing/strategy.md) |
| ADR | [0001 Architecture](adr/0001-architecture-style.md), [0002 Persistence](adr/0002-persistence.md), [0003 API Security](adr/0003-api-security.md) |

## Regla de mantenimiento

Cada cambio funcional nuevo debe actualizar al menos:

1. El spec del caso de uso afectado.
2. El inventario API si cambia un endpoint.
3. La metadata OpenAPI si cambia seguridad, multipart, deprecacion o contrato.
4. La documentacion de datos si cambia una entidad o schema.
5. La estrategia de pruebas si cambia el criterio de aceptacion o el riesgo.

## Specs por dominio

- [Autenticacion y recuperacion](specs/authentication.md), [principales](specs/principales.md), [auxiliares](specs/auxiliares.md), [estructura](specs/estructura.md).
- [Solicitudes](specs/solicitudes-administrativas.md), [rechazo](specs/rechazo-solicitud.md), [pagos CSV](specs/pagos-banco.md), [becas](specs/becas.md), [certificados](specs/certificados.md), [constancias](specs/constancias.md).
- [Seguimiento docente y formulas](specs/seguimiento-docente.md), [examen de ubicacion](specs/examen-ubicacion.md), [calificaciones](specs/calificaciones.md).
- [Q10](specs/q10.md), [upload y correo](specs/uploads-mailer.md), [reportes](specs/reportes.md), [sistema legado](specs/sistema.md).
- Backend implementado: [Estudiante nuevo: tipo y documento opcionales, escuelas PRE/POS](specs/estudiante-nuevo.md). Despliegue SQL y clasificacion historica requeridos; frontend pendiente.

Actualizar spec, metadata y pruebas; ejecutar npm run build, npm run api:export y npm run docs:update; revisar diffs y cerrar con npm run sdd:check. CI repite las verificaciones y publica evidencia. La implementacion y validacion visual frontend quedan pendientes en su repositorio.
