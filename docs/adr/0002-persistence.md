# ADR 0002: Coexistencia PostgreSQL/TypeORM y MongoDB/Mongoose

## Estado

Aceptado.

## Contexto

El sistema maneja datos relacionales transaccionales y documentos de estructura mas flexible, como actas, certificados, constancias y textos.

## Decision

Usar PostgreSQL con TypeORM para datos transaccionales y MongoDB con Mongoose para documentos.

## Consecuencias

- Entidades de negocio relacional deben usar TypeORM.
- Documentos y actas pueden usar Mongoose.
- Los cambios en PostgreSQL requieren migracion o procedimiento controlado porque `synchronize` esta desactivado.
- Cada spec debe indicar si usa entidad TypeORM, schema Mongoose o ambos.
- Las transacciones entre PostgreSQL y MongoDB no son atomicas por defecto; los flujos mixtos deben documentar compensacion o tolerancia a fallos.
