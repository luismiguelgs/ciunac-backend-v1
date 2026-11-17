# Spec: Autenticacion, Usuarios y Permisos

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Actores, objetivo y precondiciones

Usuario local, docente que vincula su cuenta y operador de usuarios/permisos. Se requiere PostgreSQL, JWT_ACCESS_SECRET y los catalogos correspondientes. La recuperacion usa MailerService.

## Flujos y contratos actuales

| Operacion | Seguridad | Resultado |
| --- | --- | --- |
| POST /auth/register | Publica | 201, token JWT como texto |
| POST /auth/login | Publica | 200, access_token y user |
| POST /auth/forgot-password | Publica | 200, mensaje generico |
| POST /auth/reset-password | Publica | 200, mensaje de actualizacion |
| POST /auth/logout | API key + JWT | 201, ok y message |
| GET /auth/profile | API key + JWT | 200, message y user |

Usuarios y rol-permisos requieren API key, JWT y el permiso de cada operacion. EXCEPTION_ROLE permite la excepcion implementada por PermissionsGuard. Los nombres de permisos y DTOs se enumeran en [OpenAPI](../api/openapi.json) y [historias](use-cases-index.md).

## Reglas y alternativas

- Registro es transaccional. Email duplicado produce 409. Para rol DOCENTE se exige documento, docente existente y ausencia de vinculacion previa; 400/404/409 segun causa.
- Login valida email/password con bcrypt; credenciales invalidas producen 401. El JWT se emite con la configuracion de expiracion vigente, normalmente 60 minutos.
- JwtStrategy comprueba ademas que el usuario del sub exista. JWT invalido, expirado o usuario inexistente produce 401.
- Logout confirma la accion pero no revoca tokens de acceso ya emitidos. No debe documentarse como una lista de revocacion.
- Recuperacion normaliza email y mantiene la misma respuesta para cuenta inexistente, OAuth o envio omitido por cooldown. No expone el token en la respuesta HTTP.
- PASSWORD_RESET_TOKEN_TTL_MINUTES tiene fallback 30; PASSWORD_RESET_COOLDOWN_SECONDS tiene fallback 60.
- El token aleatorio se envia en un enlace construido con PASSWORD_RESET_FRONTEND_URL y solo se persiste SHA-256. Un fallo SMTP invalida el token pendiente y conserva la respuesta generica.
- Reset exige confirmacion coincidente, token vigente/no usado y provider local; bloquea el token en transaccion, guarda bcrypt, limpia refreshTokenHash y marca usedAt. Un segundo uso produce 400.

## Datos e integracion

Usuario, Docente y PasswordResetToken en PostgreSQL; MailerService.sendPasswordReset usa SMTP ALUMNOS. Roles y permisos se resuelven desde RolPermiso. Los providers google/facebook registrados en la entidad no implican endpoints OAuth activos.

## Frontend y aceptacion

El frontend debe leer register como texto y login como objeto, enviar los headers exigidos y mostrar el mensaje generico de recuperacion. El enlace lleva token por query; el formulario de reset envia token, newPassword y confirmPassword.

HU-AUTH-001 a 006, HU-USR-001 y HU-ROL-001 enlazan sus CA y pruebas. La integracion prueba persistencia del hash, cambio de password y consumo unico; no envia correo real.
