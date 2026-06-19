# Spec: Uploads y Mailer

## Objetivo funcional

Gestionar carga de archivos a Google Drive y envio de correos desde canales configurados.

## Actores

- Usuario administrativo.
- Frontend CIUNAC.
- Google Drive.
- Servidores SMTP.

## Precondiciones

- API key valida.
- Credenciales Google OAuth configuradas.
- Folders de Drive configurados.
- Credenciales SMTP configuradas.

## Flujo principal: upload

1. El frontend envia archivo a `POST /upload/:folder`.
2. El controller valida que exista archivo y carpeta permitida.
3. `UploadService` resuelve carpeta destino.
4. El archivo se sube a Google Drive.
5. El backend devuelve metadata o URL segun implementacion.

## Flujo principal: mailer

1. El frontend envia payload a `POST /mailer`.
2. `MailerService` selecciona transporter por `type`.
3. El correo se envia desde el remitente configurado.
4. El backend devuelve confirmacion o error controlado.

## Flujos alternos y errores

| Caso | Resultado |
| --- | --- |
| Archivo ausente | Error controlado. |
| Carpeta invalida | `400 Bad Request`. |
| Error Google Drive | `500 Internal Server Error` controlado. |
| Tipo de mail no configurado | Error controlado. |
| Error SMTP | `500 Internal Server Error` en controller. |

## Reglas de negocio

- Carpetas permitidas: `DNIS`, `BECAS`, `VOUCHERS`, `CVS`, `CONSTANCIAS`.
- `CONSTANCIAS` puede moverse a repositorio usando carpeta especifica.
- Tipos de correo soportados por configuracion: alumnos, certificados y recauda.

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `POST` | `/upload/:folder` | ApiKey | `multipart/form-data` con archivo | Resultado de carga |
| `POST` | `/mailer` | ApiKey | `SendMailDto` | Confirmacion de envio |

## Datos involucrados

- DTO: `SendMailDto`.
- No hay entidad propia de upload; el resultado puede asociarse a documentos segun caso de uso.

## Integraciones externas

- Google Drive API.
- SMTP via Nodemailer.

## Criterios de aceptacion

- Dado una carpeta permitida y archivo valido, cuando se sube, entonces se almacena en Drive.
- Dado una carpeta invalida, cuando se sube, entonces se rechaza con `400`.
- Dado un tipo de correo valido, cuando se envia, entonces se usa el remitente correcto.
- Dado un error externo, entonces se responde con error controlado sin exponer credenciales.

## Casos de prueba sugeridos

- Unit: resolucion de carpetas y seleccion de transporter.
- Integration: upload con mock de Google Drive.
- Integration: mailer con mock de Nodemailer.

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controllers | `src/shared/upload/upload.controller.ts`, `src/shared/mailer/mailer.controller.ts` |
| Services | `UploadService`, `MailerService` |
| DTO | `src/shared/mailer/dto/send-mail.dto.ts` |
