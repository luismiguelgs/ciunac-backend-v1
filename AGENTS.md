# AGENTS.md

This document provides essential information for agentic coding agents operating in the `ciunac-backend-v1` repository.

## 1. Build, Lint, and Test Commands

The project uses [NestJS](https://nestjs.com/) and [npm](https://www.npmjs.com/).

### Build and Run

- **Build project**: `npm run build`
- **Start development (watch mode)**: `npm run start:dev`
- **Start production**: `npm run start:prod`

### Linting and Formatting

- **Run linter**: `npm run lint` (uses ESLint with `--fix`)
- **Format code**: `npm run format` (uses Prettier)

### Testing

- **Run all unit tests**: `npm run test`
- **Run a single test file**: `npx jest src/path/to/file.spec.ts`
- **Run tests in watch mode**: `npm run test:watch`
- **Run e2e tests**: `npm run test:e2e`
- **Test coverage**: `npm run test:cov`

## 2. Code Style and Guidelines

### Architecture

- **NestJS Standard**: Follow the standard NestJS module-based architecture (`.module.ts`, `.controller.ts`, `.service.ts`).
- **Persistence**: Use **TypeORM** for PostgreSQL and **Mongoose** for MongoDB (see `src/modules/auxiliares/textos`).
- **Validation**: Use `class-validator` and `class-transformer` in DTOs. Global validation is enabled in `main.ts` with `whitelist: true` and `transform: true`.

### Imports

- **Absolute Paths**: Prefer absolute paths starting with `src/` (e.g., `import { ... } from 'src/modules/...'`).
- **Relative Paths**: Use relative paths for files within the same module directory.

### Naming Conventions

- **Files**: Use kebab-case with descriptive suffixes: `name.controller.ts`, `name.service.ts`, `create-name.dto.ts`.
- **Classes**: Use PascalCase (e.g., `UsuariosController`, `CreateUsuarioDto`).
- **Variables/Functions**: Use camelCase.
- **Database Tables/Columns**: Use snake_case for `@Entity` and `@Column` names (e.g., `@Entity('perfil_docente')`, `@Column({ name: 'docente_id' })`).

### Formatting (Prettier/ESLint)

- **Quotes**: Use single quotes `'` as per `.prettierrc`.
- **Indentation**: Use tabs (observed in `main.ts` and `usuarios.controller.ts`).
- **Trailing Commas**: Set to `all`.

### Types and Interfaces

- **Strict Typing**: Always define return types for controller methods and service functions (e.g., `Promise<Usuario | null>`).
- **DTOs**: Use classes with `class-validator` decorators for all request payloads.
- **Entities**: Use TypeORM decorators for database models.

### Error Handling

- **NestJS Exceptions**: Use built-in `HttpException` or specialized ones like `NotFoundException`, `BadRequestException`, etc.
- **Async/Await**: Use `async/await` for all asynchronous operations, particularly database calls.

### Security

- **Guards**: Apply `ApiKeyGuard`, `AuthGuard('jwt')`, and `PermissionsGuard` where applicable.
- **Permissions**: Use the `@RequirePermissions('permission_name')` decorator on controller methods.
- **Helmet/CORS**: Basic security headers (Helmet) and CORS are configured in `main.ts`.

## 3. Reference Files

- `package.json`: Dependency and script management.
- `src/main.ts`: Global configuration (CORS, Pipes, Helmet).
- `src/app.module.ts`: Root module.
- `tsconfig.json`: TypeScript configuration and path aliases.
