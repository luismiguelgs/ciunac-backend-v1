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

## Cargas CSV

Procesos:

- `pagos-banco/upload`: procesa pagos bancarios.
- `encuesta-respuestas/upload`: procesa respuestas de encuesta docente.

Reglas de documentacion:

- Cada CSV debe tener spec con columnas esperadas.
- Deben documentarse validaciones, modo de rechazo y efecto sobre base de datos.
- Los procesos masivos deben tener pruebas con filas validas, invalidas y duplicadas.
