# Documentación del Proyecto: CIUNAC Backend

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Visión General
El proyecto **CIUNAC Backend** es una aplicación de servidor escalable construida sobre el ecosistema Node.js utilizando NestJS. Está diseñada bajo una arquitectura modular orientada a dominios, lo que permite una alta cohesión y bajo acoplamiento, facilitando el mantenimiento y la escalabilidad horizontal y vertical del sistema.

## Stack Tecnológico
- **Framework Principal:** [NestJS](https://nestjs.com/) (v11) - Framework progresivo para Node.js.
- **Lenguaje:** TypeScript, asegurando tipado estático y reducción de errores en tiempo de ejecución.
- **Bases de Datos:**
  - **PostgreSQL:** Base de datos relacional principal, gestionada a través de **TypeORM**.
  - **MongoDB:** Base de datos NoSQL auxiliar, gestionada a través de **Mongoose** (ideal para logs, auditorías o datos no estructurados).
- **Caché:** Redis (a través de `cache-manager` y `@nestjs/cache-manager`).
- **Autenticación y Seguridad:** JWT (JSON Web Tokens), Passport, Guardias de API Key y Helmet.
- **Validación:** `class-validator` y `class-transformer` mediante el uso de DTOs (Data Transfer Objects).

## Arquitectura y Estructura
El proyecto sigue una arquitectura fuertemente modular, dividida por contextos de negocio (Feature Modules). Algunos de los dominios principales incluyen:

- **Módulos Principales:** `Estudiantes`, `Docentes`.
- **Estructura y Auxiliares:** `Escuelas`, `Facultades`, `Idiomas`, `Niveles`, `Ciclos`, `Modulos`.
- **Calificaciones:** `Evaluaciones`, `Notas`, `ActaNotas`.
- **Administrativas:** `Solicitudes`, `Constancias`, `Certificados`.
- **Seguimiento Docente:** `PerfilDocente`, `CumplimientoDocente`, `Encuestas`, `DashboardDocentes`.

Cada módulo típicamente se estructura en:
- `*.controller.ts`: Manejo de rutas HTTP y delegación a servicios.
- `*.service.ts`: Lógica de negocio y acceso a base de datos.
- `*.module.ts`: Definición e inyección de dependencias.
- `entities/`: Definición de las entidades y esquemas de base de datos.
- `dto/`: Objetos de transferencia de datos con reglas de validación estricta.

## Análisis de Escalabilidad y Mejores Prácticas implementadas

Tras la revisión técnica del código, se determina que el proyecto es altamente escalable y cumple con excelentes prácticas de ingeniería de software. 

### Puntos Destacados de Buenas Prácticas:
1. **Manejo de Transacciones (ACID):** Uso de `QueryRunner` de TypeORM para asegurar la atomicidad en operaciones complejas de base de datos (por ejemplo, cargas masivas de archivos CSV). Esto previene la corrupción de datos.
2. **Optimización de Rendimiento y Memoria:** En procesos masivos, el código implementa estrategias de "Caché en Memoria" (usando diccionarios en Javascript) para almacenar relaciones. Esto evita el conocido problema de consultas *N+1*, reduciendo drásticamente la carga sobre la base de datos.
3. **Validación Robusta:** Se aplican decoradores de validación de manera estricta en las entradas mediante el uso de los DTOs, garantizando que datos anómalos no lleguen a la capa de servicio.
4. **Arquitectura Limpia y Modular:** Aislamiento correcto de la lógica de negocio, centralizando lógica transversal (ej: envío de correos o manejo de archivos) en módulos compartidos dentro del directorio `shared/`.
5. **Seguridad Integrada:** Se hace uso de utilidades como `Helmet` y flujos de autenticación mixtos (JWT y API Keys), protegiendo adecuadamente los endpoints.

## Comandos Útiles para el Desarrollo

### Instalación de dependencias
```bash
$ npm install
```

### Ejecutar la aplicación
```bash
# Entorno de desarrollo
$ npm run start

# Modo Watch (recarga automática)
$ npm run start:dev

# Modo de producción
$ npm run start:prod
```

### Ejecutar Linters y Pruebas
```bash
# Linter y Formateo
$ npm run lint
$ npm run format

# Pruebas Unitarias
$ npm run test
```
