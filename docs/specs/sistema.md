# Spec: Sistema y Utilidades Historicas

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, flujo y contratos

| Ruta | Seguridad actual | Comportamiento |
| --- | --- | --- |
| GET / | Publica | Texto devuelto por AppService.getHello |
| GET /login?user=... | Publica | Utilidad historica que genera token; no es POST /auth/login |
| GET /validar?token=... | Publica | Utilidad historica que valida un token |
| GET /profile | JWT | Identidad del usuario validado por JwtStrategy |

Estas rutas se inventarian porque existen en la aplicacion. No representan una recomendacion para construir el login del frontend; usar el dominio authentication.

## Precondiciones, alternativas y datos

JWT_ACCESS_SECRET y usuario existente para el perfil protegido. No hay entidad propia ni un alta academica asociada. Credenciales JWT invalidas producen 401 en /profile; errores de las utilidades dependen de AppService.

## Aceptacion y limitaciones

HU-SYS-001 enlaza contratos y guards de estas cuatro operaciones. El retiro o restriccion de utilidades esta en BL-SEC-002 del [backlog](backlog.md). Ver [OpenAPI](../api/openapi.json).
