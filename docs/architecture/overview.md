# Arquitectura General

CIUNAC Backend es un monolito modular construido con NestJS. El sistema organiza la logica por dominios funcionales y expone una API HTTP consumida por frontends administrativos y publicos.

## Estilo arquitectonico

- Monolito modular orientado a dominios.
- Modulos NestJS por feature, con `controller`, `service`, `module`, `dto` y `entities` o `schemas`.
- Persistencia hibrida: PostgreSQL para entidades relacionales y MongoDB para documentos no relacionales.
- Seguridad por capas: CORS, Helmet, API key, JWT y permisos por rol.
- Integraciones externas encapsuladas en servicios dedicados: Q10, Google Drive y correo SMTP.

## Capas principales

| Capa | Responsabilidad |
| --- | --- |
| Controllers | Exponen rutas HTTP, validan parametros basicos, aplican guards e interceptores. |
| DTOs | Definen contratos de entrada y validaciones con `class-validator` y `class-transformer`. |
| Services | Contienen logica de negocio y orquestan repositorios, modelos e integraciones. |
| Persistence | TypeORM repositories para PostgreSQL y Mongoose models para MongoDB. |
| Guards | Validan API key, JWT y permisos por rol. |
| Shared | Servicios reutilizables como carga a Drive y envio de correos. |

## Decisiones tecnicas actuales

- `ConfigModule` es global y lee `.env`.
- `ValidationPipe` global usa `whitelist`, `forbidNonWhitelisted`, `transform` y conversion implicita.
- `TypeOrmModule` usa `autoLoadEntities: true` y `synchronize: false`.
- `MongooseModule` se configura con `MONGO_URI`.
- `JwtModule` usa `JWT_ACCESS_SECRET` y tokens con expiracion de 60 minutos.

## Riesgos y oportunidades

- Hay modulos importados dos veces en `AppModule` (`EscuelasModule`, `CumplimientoDocenteModule`), lo que conviene revisar.
- Algunos controllers de `seguimiento_docente` no muestran guards a nivel de clase; deben revisarse antes de exponer endpoints sensibles.
- La documentacion OpenAPI no esta implementada aun; este repositorio documenta el backlog para incorporarla de forma progresiva.
- Existen errores lanzados como `Error` generico en varios servicios; conviene migrar a excepciones HTTP NestJS para respuestas consistentes.
