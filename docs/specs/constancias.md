# Spec: Emision y Firma de Constancias

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El administrativo guarda y procesa la firma de Constancia en MongoDB, relacionada mediante id_solicitud con Solicitud PostgreSQL. Requiere API key y configuracion Drive.

## Flujo y reglas

1. POST /constancias guarda el DTO y devuelve _id/id como texto. El servicio create actual no cambia el estado de Solicitud.
2. El archivo se carga usando upload/CONSTANCIAS; los servicios asocian el identificador segun su flujo.
3. PATCH /constancias/procesar-firma recibe constanciaId, fileId opcional, solicitudId opcional y signedFileId opcional.
4. Valida la solicitud persistida y su existencia; una solicitudId incompatible produce 400.
5. Resuelve original y version firmada, mueve al repositorio y guarda impreso, driveId y URL de descarga.
6. Cambia la solicitud a TERMINADO=3. Ante fallo PostgreSQL restaura la constancia al estado anterior; las acciones Drive ya ejecutadas no se revierten atomicamente.
7. Limpieza del original es posterior; un fallo puede devolver warning sin deshacer el procesamiento exitoso.

La version firmada admite `[R]` (nuevo) y `[FIRMADO]` (historico), como prefijo o sufijo, sin distinguir mayusculas y con espacios opcionales dentro de los corchetes: `[R] constancia-123.pdf`, `constancia-123[R].pdf` y `constancia-123[FIRMADO].pdf`. La busqueda, signedFileId y los reintentos usan el mismo nombre base normalizado. Si existen varias copias compatibles, se elige la mas reciente por modifiedTime entre ambos marcadores. Una ausencia devuelve 404 mencionando `[R]` y `[FIRMADO]`; no se modifican estados ni se elimina el original. No requiere cambios del frontend ni migraciones.

Respuesta: success, fileId, name, viewLink, originalTrashed y warning opcional.

## Consultas y alternativas

Pendientes: impreso=false/aceptado=false. Impresos: impreso=true/aceptado=false. Aceptados: ambos true. Consulta por solicitud utiliza id_solicitud. FindOne/update pueden devolver null. No existe DELETE publico de constancias.

## Frontend, datos y aceptacion

El frontend distingue ID de constancia, ID de solicitud e ID Drive, maneja warnings y refresca el estado. No asume ASIGNADO=2 por guardar un documento pendiente.

HU-CON y sus CA enlazan las rutas con pruebas HTTP; los escenarios de firma usan servicios reales y persistencia aislada. Ver [OpenAPI](../api/openapi.json) y [certificados](certificados.md) para el flujo equivalente.
