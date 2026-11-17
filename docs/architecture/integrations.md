# Integraciones

## Q10

Ubicacion: `src/q10`.

Responsabilidades:

- Listar horarios y cursos.
- Guardar horarios/cursos en base de datos.
- Crear estudiante en Q10.
- Registrar estudiante en programa.

Variables:

- `API_KEY_Q10`

Specs relacionados:

- [Q10](../specs/q10.md)

## Google Drive

Ubicacion: `src/shared/upload`.

Responsabilidades:

- Subir archivos por carpeta funcional.
- Mover constancias a repositorio.
- Actualizar datos asociados a constancias.

Variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_FOLDER_DNIS`
- `GOOGLE_DRIVE_FOLDER_VOUCHERS`
- `GOOGLE_DRIVE_FOLDER_BECAS`
- `GOOGLE_DRIVE_FOLDER_CVS`
- `GOOGLE_DRIVE_FOLDER_CONSTANCIAS`
- `GOOGLE_DRIVE_FOLDER_CONSTANCIAS_REPOSITORIO`
- `GOOGLE_DRIVE_FOLDER_CERTIFICADOS`
- `GOOGLE_DRIVE_FOLDER_CERTIFICADOS_REPOSITORIO`

Certificados requiere carpeta del periodo existente en el repositorio. La firma guarda URL del firmado en Mongo y cambia solicitud a 3; ante fallo PostgreSQL intenta restaurar Mongo, pero no revierte todos los movimientos Drive. Ver [certificados](../specs/certificados.md) y [constancias](../specs/constancias.md).

## Mailer SMTP

Ubicacion: `src/shared/mailer`.

Canales:

- `ALUMNOS`
- `CERTIFICADO`
- `RECAUDA`

Variables:

- `ALUMNOS_EMAIL_USER`, `ALUMNOS_EMAIL_PASSWORD`
- `CERT_EMAIL_USER`, `CERT_EMAIL_PASSWORD`
- `RECAUDA_EMAIL_USER`, `RECAUDA_EMAIL_PASSWORD`

Recuperacion usa ALUMNOS y PASSWORD_RESET_FRONTEND_URL; rechazo envia SOLICITUD_RECHAZADA al email oficial del estudiante tras guardar. No requiere segunda llamada frontend a mailer. Fallos SMTP no revierten un rechazo; en recuperacion se invalida el token no entregado.

## Cargas CSV

Procesos:

- `pagos-banco/upload`: procesa pagos bancarios.
- `encuesta-respuestas/upload`: procesa respuestas de encuesta docente.

Reglas de documentacion:

- Cada CSV debe tener spec con columnas esperadas.
- Deben documentarse validaciones, modo de rechazo y efecto sobre base de datos.
- Los procesos masivos deben tener pruebas con filas validas, invalidas y duplicadas.

Formatos y limites vigentes: [pagos banco](../specs/pagos-banco.md), [encuestas](../specs/seguimiento-docente.md). No aplicar al CSV de encuestas las garantias transaccionales del CSV bancario.

## Fallos parciales y reportes

Q10 puede confirmar el alta antes de fallar sincronizacion local o matricula. Los codigos Q10_CREATED_LOCAL_SYNC_FAILED y Q10_CREATED_PROGRAM_PENDING prohiben reintento automatico. UUID local y Codigo_estudiante son identidades distintas.

Reportes certificadosr/tiempos consultan ambas persistencias y requieren API key. Q10, Drive y SMTP se simulan exclusivamente en fronteras de las pruebas; servicios y repositorios criticos permanecen reales. Ver [testing](../testing/strategy.md).
