# Spec: Authentication

## Objetivo funcional

Permitir registro, login, perfil autenticado, logout y gestion de permisos para usuarios del sistema CIUNAC.

## Actores

- Administrador CIUNAC.
- Usuario autenticado.
- Frontend CIUNAC.

## Precondiciones

- `JWT_ACCESS_SECRET` configurado.
- `API_KEY` configurado para endpoints protegidos.
- Roles y permisos disponibles para operaciones de gestion.
- Para registrar docentes, debe existir un docente asociado cuando el rol lo exija.

## Flujo principal

1. El usuario envia credenciales a `POST /auth/login`.
2. El backend valida email y password.
3. El backend genera token JWT.
4. El frontend usa el token en `Authorization: Bearer`.
5. Endpoints protegidos validan JWT, API key y permisos cuando aplique.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| Usuario inexistente | `401 Unauthorized`. |
| Password invalido | `401 Unauthorized`. |
| Usuario duplicado en registro | `409 Conflict`. |
| Docente requerido no existe | `404 Not Found`. |
| Falta API key | `401 Unauthorized`. |
| Falta permiso | `403 Forbidden`. |

## Reglas de negocio

- `usuarios` y `rol-permisos` requieren API key, JWT y permisos.
- El rol definido en `EXCEPTION_ROLE` puede saltar validacion especifica de permisos segun `PermissionsGuard`.
- El token JWT expira en 60 minutos segun configuracion actual.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/auth/register` | Publico | `RegisterDto` | Usuario creado o error de validacion |
| `POST` | `/auth/login` | Publico | `LoginDto` | Token y datos del usuario |
| `POST` | `/auth/logout` | Publico actual | Token o payload segun implementacion | Confirmacion de logout |
| `GET` | `/auth/profile` | JWT + ApiKey | Bearer token | Perfil autenticado |
| `POST` | `/usuarios` | ApiKey + JWT + Permisos | `CreateUsuarioDto` | Usuario creado |
| `GET` | `/usuarios` | ApiKey + JWT + Permisos | N/A | Lista de usuarios |
| `GET` | `/usuarios/buscar/:email` | ApiKey + JWT + Permisos | Email | Usuario encontrado |
| `GET` | `/rol-permisos/rol/:rol` | ApiKey + JWT + Permisos | Rol | Permisos del rol |

## Datos involucrados

- Entidades: `Usuario`, `RolPermiso`, `Estudiante`, `Docente`.
- DTOs: `RegisterDto`, `LoginDto`, `CreateUsuarioDto`, `UpdateUsuarioDto`, `CreateRolPermisoDto`.

## Integraciones externas

- No hay integracion externa obligatoria en login local.
- El codigo contempla providers OAuth como `google` y `facebook` en usuario.

## Criterios de aceptacion

- Dado un usuario valido, cuando hace login, entonces recibe token JWT.
- Dado un token invalido, cuando consulta perfil, entonces recibe `401`.
- Dado un usuario sin permiso, cuando invoca una accion restringida, entonces recibe `403`.
- Dado un docente ya vinculado, cuando se intenta registrar otro usuario docente para el mismo documento, entonces se rechaza.

## Casos de prueba sugeridos

- Unit: `AuthService.validateUser`, `AuthService.login`, `PermissionsGuard`.
- Integration: registro de usuario y busqueda por email.
- E2E: login -> profile -> accion con permisos.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controllers | `src/modules/authentication/auth/auth.controller.ts`, `src/modules/authentication/usuarios/usuarios.controller.ts`, `src/modules/authentication/rol_permisos/rol_permisos.controller.ts` |
| Services | `AuthService`, `UsuariosService`, `RolPermisosService`, `RolesService` |
| Guards | `ApiKeyGuard`, `JwtAuthGuard`, `PermissionsGuard` |
| Entities | `Usuario`, `RolPermiso` |
