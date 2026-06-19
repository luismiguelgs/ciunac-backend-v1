# ADR 0003: Seguridad API con API Key, JWT y Permisos

## Estado

Aceptado.

## Contexto

El backend es consumido por frontends CIUNAC y expone operaciones administrativas sensibles. El codigo actual ya implementa `ApiKeyGuard`, `JwtAuthGuard`, `PermissionsGuard` y `@RequirePermissions`.

## Decision

Mantener seguridad por capas:

- API key para validar clientes autorizados.
- JWT para identidad de usuario.
- Permisos por rol para acciones administrativas.
- Helmet, CORS y ValidationPipe global como controles transversales.

## Consecuencias

- Todo endpoint nuevo debe declarar explicitamente su modelo de auth.
- Operaciones administrativas deben usar API key y, cuando aplique, JWT + permisos.
- Endpoints sin guard visible deben revisarse antes de considerarse productivos.
- La futura documentacion OpenAPI debe incluir `@ApiBearerAuth` y `@ApiHeader` para reflejar seguridad real.
