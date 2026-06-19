# Contenedores y Capas

```mermaid
flowchart TB
    Client["Frontends / clientes HTTP"] --> Main["Nest application bootstrap"]
    Main --> Pipes["ValidationPipe global"]
    Main --> Guards["Guards: ApiKeyGuard, JwtAuthGuard, PermissionsGuard"]
    Guards --> Controllers["Controllers por dominio"]
    Pipes --> Controllers
    Controllers --> Services["Services de negocio"]
    Services --> TypeOrm["TypeORM repositories"]
    Services --> Mongoose["Mongoose models"]
    Services --> Shared["Shared services: upload, mailer"]
    Services --> Q10["Q10 service"]
    TypeOrm --> PostgreSQL["PostgreSQL"]
    Mongoose --> MongoDB["MongoDB"]
    Shared --> Drive["Google Drive"]
    Shared --> SMTP["SMTP"]
    Q10 --> Q10Api["Q10 API externa"]
```

## Bootstrap

`src/main.ts` crea la aplicacion, habilita CORS para dominios conocidos, aplica `ValidationPipe` global y configura Helmet. La app escucha en `PORT` o `3000`.

## Modulo raiz

`src/app.module.ts` configura:

- `ConfigModule.forRoot` global.
- `JwtModule` y `PassportModule`.
- `TypeOrmModule.forRootAsync` para PostgreSQL.
- `MongooseModule.forRootAsync` para MongoDB.
- Modulos funcionales bajo `src/modules`.
- Integraciones `Q10Module`, `UploadModule` y `MailerModule`.

## Convenciones de modulo

Cada feature debe mantener:

- Controller para rutas HTTP.
- Service para logica de negocio.
- DTOs para request payloads.
- Entity TypeORM o Schema Mongoose segun persistencia.
- Tests unitarios en `*.spec.ts`.

## Backlog OpenAPI

Para generar contratos verificables:

1. Instalar `@nestjs/swagger` y `swagger-ui-express`.
2. Configurar `SwaggerModule` en `main.ts`.
3. Agregar `@ApiTags` por controller.
4. Agregar `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` y `@ApiHeader({ name: 'x-api-key' })`.
5. Decorar DTOs con `@ApiProperty`.
6. Publicar una ruta interna, por ejemplo `/api/docs`, protegida segun ambiente.
