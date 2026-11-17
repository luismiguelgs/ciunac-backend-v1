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
- OpenAPI esta implementado y exportado reproduciblemente; [paridad y contratos](../api/openapi.md) comprueban su correspondencia con controllers y guards.
- Existen errores lanzados como `Error` generico en varios servicios; conviene migrar a excepciones HTTP NestJS para respuestas consistentes.

## Documentacion y verificacion

El [inventario generado](module-inventory.md) descubre modulos y operaciones sin fijar los conteos en scripts. Los [casos de uso](../specs/use-cases-index.md) cubren todos los dominios, incluidos reportes y recuperacion de contrasena. [Workflow SDD](../specs/workflow.md) define estados, evidencia y mantenimiento. Las propuestas funcionales estan separadas en el backlog.
