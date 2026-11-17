# Spec: Emision, Archivo y Firma de Certificados

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Actores, precondiciones y datos

Administrativo, frontend y Drive. API key; Solicitud en PostgreSQL y Certificado en MongoDB. La solicitud y carpeta de periodo deben existir al procesar firma.

## Creacion y carga

1. POST /certificados guarda el DTO como documento y devuelve _id/id como texto.
2. La creacion no actualiza por si misma el estado de la solicitud. url puede permanecer null hasta procesar firma.
3. POST /certificados/:id/archivo recibe multipart file y fileId opcional. Exige PDF, consulta el certificado, carga por el servicio Drive en CERTIFICADOS y guarda driveId.
4. La respuesta de carga contiene success, id, name, viewLink, downloadLink, folder y modifiedTime opcional; ese id es de Drive, no el _id del certificado.

## Procesamiento de firma

1. PATCH /certificados/procesar-firma recibe certificadoId, fileId opcional, solicitudId opcional y signedFileId opcional.
2. El backend usa la solicitud persistida; una solicitudId distinta se rechaza con 400. Recursos inexistentes producen 404.
3. Resuelve original desde driveIdOriginal/driveId/fileId y carpeta del periodo; encuentra version firmada y la mueve.
4. Guarda impreso=true, driveId de la version firmada y url=https://drive.google.com/uc?export=download&id=ID_FIRMADO; conserva driveIdOriginal y originalTrashed.
5. Cambia la Solicitud a TERMINADO=3. Si falla PostgreSQL restaura el estado anterior del documento MongoDB; los efectos ya realizados en Drive no son una transaccion distribuida.
6. Intenta enviar el original a papelera. Fallo de limpieza no revierte la firma; devuelve warning y originalTrashed=false.

Respuesta de firma: success, fileId, name, viewLink, originalTrashed y warning opcional. No devuelve un objeto certificado embebido.

## Consultas y estados documentales

Pendientes: impreso=false/aceptado=false. Firmados: impreso=true/aceptado=false. Aceptados: impreso=true/aceptado=true. Se consulta tambien por solicitudId, por impreso o por ID. No existe ruta DELETE publica en este controller.

## Frontend, alternativas y aceptacion

El frontend conserva los IDs separados, adjunta PDF, solicita firma y muestra warning cuando la limpieza queda pendiente. No construye la URL oficial por su cuenta ni decide finalizar la solicitud en otra llamada.

HU-CER y sus CA enlazan contratos y pruebas. La integracion demuestra carga, URL y estado final, y restauracion MongoDB ante un fallo PostgreSQL con Drive simulado. Ver [OpenAPI](../api/openapi.json) para campos y tipos completos.
