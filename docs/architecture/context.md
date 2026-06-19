# Contexto del Sistema

Este diagrama muestra CIUNAC Backend como sistema central y sus dependencias principales.

```mermaid
C4Context
    title Contexto CIUNAC Backend
    Person(admin, "Administrador CIUNAC", "Gestiona usuarios, estructura, solicitudes, pagos y reportes")
    Person(estudiante, "Estudiante", "Solicita constancias, certificados, becas o procesos academicos")
    Person(docente, "Docente", "Participa en procesos de perfil y seguimiento docente")
    System(frontend, "Frontends CIUNAC", "Aplicaciones web administrativas y publicas")
    System(api, "CIUNAC Backend", "API NestJS modular")
    SystemDb(pg, "PostgreSQL", "Datos transaccionales relacionales")
    SystemDb(mongo, "MongoDB", "Documentos, actas y textos")
    System_Ext(q10, "Q10", "Sistema academico externo")
    System_Ext(drive, "Google Drive", "Repositorio de archivos")
    System_Ext(smtp, "SMTP", "Envio de correos")

    Rel(admin, frontend, "Usa")
    Rel(estudiante, frontend, "Usa")
    Rel(docente, frontend, "Usa")
    Rel(frontend, api, "HTTP JSON, JWT, x-api-key")
    Rel(api, pg, "TypeORM")
    Rel(api, mongo, "Mongoose")
    Rel(api, q10, "HTTP API")
    Rel(api, drive, "Google APIs")
    Rel(api, smtp, "Nodemailer")
```

## Sistemas externos

| Sistema | Uso actual |
| --- | --- |
| Frontends CIUNAC | Consumen endpoints con `Authorization` y/o `x-api-key`. |
| PostgreSQL | Entidades principales: usuarios, estudiantes, docentes, estructura, calificaciones, solicitudes, pagos y seguimiento docente. |
| MongoDB | Schemas de textos, certificados, constancias, actas y solicitudes de beca. |
| Q10 | Creacion de estudiantes y gestion de horarios/cursos. |
| Google Drive | Carga y movimiento de archivos para DNI, becas, vouchers, CVs y constancias. |
| SMTP | Correos por canales de alumnos, certificados y recauda. |
