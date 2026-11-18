# Spec: Archivos Drive y Correo

Version 1.1. Fecha: 2026-11-06. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El cliente carga archivos y el backend envia notificaciones. Requiere API key, credenciales OAuth Drive/carpetas y credenciales SMTP de los canales usados.

## Carga publica

POST /upload/:folder recibe multipart file obligatorio; nombre y fileId son opcionales tambien en Swagger. Si se omite nombre, se conserva el nombre original del archivo. El controller permite DNIS, VOUCHERS, BECAS, CVS y CONSTANCIAS. CERTIFICADOS se usa internamente desde el endpoint dedicado de certificados.

La carga devuelve success, id, name, viewLink, downloadLink, folder y modifiedTime opcional. Puede reemplazar un archivo cuando se proporciona fileId. Un archivo ausente lanza actualmente Error generico; no documentar 400 universal. Una carpeta invalida produce 400.

Para un DNI usar /upload/DNIS y pasar su viewLink como imgDoc al registrar o actualizar al estudiante. La respuesta no incluye una propiedad url. Drive puede omitir enlaces y el servicio los representa como cadena vacia; comprobar viewLink antes de continuar. Upload no guarda automaticamente estudiantes.img_doc. Se mantienen los permisos actuales de lectura publica por enlace; BL-UPL-001 sigue pendiente.

El backend de [estudiante nuevo (HU-EST-002)](estudiante-nuevo.md) permite enviar opcionalmente el viewLink de `POST /upload/DNIS` como imgDoc al alta Q10 y lo guarda en `estudiantes.img_doc`, sin enviarlo a Q10. Valida URL HTTP/HTTPS absoluta, pero no verifica pertenencia a DNIS por API Drive. El upload por si solo no asocia el archivo; formatos, limites, acceso y limpieza siguen pendientes en BL-UPL-001.

## Firma y repositorios

El servicio reconoce versiones con `[R]` o `[FIRMADO]`, sin distinguir mayusculas y admitiendo espacios dentro de los corchetes. Acepta prefijo o sufijo, por ejemplo `[R] constancia-123.pdf`, `constancia-123[R].pdf` o `constancia-123[FIRMADO].pdf`, con o sin extension. Compara el nombre base completo tras quitar el marcador y normalizar separadores/extensiones/espacios. Entre copias relacionadas de ambos formatos, selecciona la de modifiedTime mas reciente; ignora archivos de otros documentos y marcadores distintos.

La misma validacion se aplica a signedFileId explicito y a reintentos con un archivo ya firmado. Si no hay coincidencia, devuelve 404 indicando los dos marcadores aceptados. Mueve la version al repositorio, asegura permiso de lectura publico y procesa la limpieza del original. Certificados resuelve ademas una carpeta del periodo existente; no la crea automaticamente. No renombra archivos ni modifica registros historicos; no cambian endpoints, DTO ni respuesta.

Las transiciones, URL persistida, reintentos de limpieza y compensacion se especifican en [certificados](certificados.md) y [constancias](constancias.md).

## Correo

POST /mailer recibe SendMailDto y devuelve { "message": "success" } con 201. Selecciona canal ALUMNOS/CERTIFICADO/RECAUDA segun el tipo soportado. Un error de envio en el controller responde 500.

Rechazo y recuperacion llaman MailerService desde backend; el frontend no debe enviar una segunda notificacion. No hay cola ni outbox agregada por esta entrega.

## Datos, aceptacion y frontend

Upload no tiene tabla propia. Los servicios de documentos asocian sus IDs/URL en MongoDB. SMTP no modifica automaticamente solicitudes.

HU-UPL/HU-MAI y sus CA prueban HTTP y seguridad. Las pruebas unitarias verifican fronteras Drive/SMTP y las de integracion mantienen reales los servicios de documentos con repositorios; no llaman proveedores externos. El frontend usa FormData y presenta warnings sin repetir operaciones completas.
