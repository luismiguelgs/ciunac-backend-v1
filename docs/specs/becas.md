# Spec: Solicitudes de Beca

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo y precondiciones

Un solicitante/operador registra y consulta la documentacion de beca. Requiere API key, MongoDB y datos de la solicitud relacionada segun DTO.

## Proceso

1. Obtener o crear la solicitud administrativa mediante su contrato.
2. Cargar evidencias por upload/BECAS cuando corresponde.
3. Enviar CreateSolicitudbecaDto a POST /solicitudbecas.
4. Consultar listado, documento por ID o filtro /estado/:estado.
5. Actualizar o eliminar con las rutas existentes.

## Reglas, errores y datos

SolicitudBeca es un documento MongoDB; no debe confundirse con la entidad PostgreSQL Solicitud. El CRUD no implementa por si mismo una aprobacion automatica, evaluacion socioeconomica ni notificacion. Las reglas observadas son DTO, persistencia y filtro por estado; cualquier flujo adicional es propuesta.

## Contratos, frontend y aceptacion

Usar [OpenAPI](../api/openapi.json) y HU-BEC-001 en [el indice](use-cases-index.md). El frontend vincula evidencias y solicitud con los identificadores del contrato, maneja errores y vuelve a consultar despues de modificar. CA-BEC-001 prueba contrato HTTP y seguridad; no acredita una politica de asignacion de beca.
