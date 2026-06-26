# Documentacion CIUNAC Backend

Esta carpeta contiene la documentacion versionada del backend CIUNAC. Esta pensada para dos audiencias: negocio, que necesita entender procesos y responsabilidades, y equipo tecnico, que necesita arquitectura, contratos, trazabilidad y criterios de prueba.

## Como leer esta documentacion

- Para una vista general del sistema, empezar por [Arquitectura general](architecture/overview.md).
- Para entender dominios y modulos NestJS, leer [Mapa de modulos](architecture/modules.md).
- Para revisar seguridad, variables sensibles y riesgos, leer [Seguridad](architecture/security.md).
- Para revisar persistencia, leer [Datos y persistencia](architecture/data.md).
- Para implementar o validar endpoints, usar [Inventario API](api/endpoints.md) y [Swagger / OpenAPI](api/openapi.md).
- Para trabajar con spec-driven development, usar [Plantilla de specs](specs/spec-template.md) y [Indice de casos de uso](specs/use-cases-index.md).
- Para pruebas, usar [Estrategia de testing](testing/strategy.md).
- Para operacion y configuracion, usar [Configuracion operacional](operations/configuration.md).

## Estado inicial

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
| Specs | [Template](specs/spec-template.md), [Use cases](specs/use-cases-index.md) |
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
