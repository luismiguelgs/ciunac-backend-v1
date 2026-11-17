# Spec: Solicitudes Administrativas

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El estudiante/operador registra un tramite y el administrativo consulta o actualiza su estado. Requiere API key y PostgreSQL con estudiante, tipo, idioma, nivel y estado validos.

## Flujo principal

1. Crear mediante POST /solicitudes y CreateSolicitudDto.
2. Si manual=true, el backend bloquea al estudiante y rechaza con 409 SOLICITUD_MANUAL_DUPLICADA otra solicitud pendiente del mismo documento, idioma y nivel; los estados pendientes son 1, 2 y 4.
3. Consultar por documento, tipo, estado o rango de fechas. Certificados usa tipos 1-4; constancias 5-6; examen de ubicacion 7.
4. Conciliar el pago por el [flujo bancario](pagos-banco.md).
5. Emitir [certificado](certificados.md), [constancia](constancias.md) o [beca](becas.md) mediante su contrato propio.
6. Ejecutar rechazo por [el endpoint dedicado](rechazo-solicitud.md) cuando corresponda.

## Reglas y estados

NUEVO=1, ASIGNADO=2, TERMINADO=3, PAGADO=4, RECHAZADO=5 y OBSERVADO=12. La referencia de estos estados es SOLICITUD; no usar IDs del examen.

PATCH generico guarda los campos admitidos, estadoId y modificadoEn sin una maquina integral de transiciones. La creacion del documento MongoDB de certificado/constancia no cambia por si sola el estado de Solicitud en los servicios actuales. Procesar firma cambia la solicitud a 3.

## Alternativas y contratos

- Creacion manual: estudiante inexistente 404 y duplicado pendiente 409; operacion transaccional.
- Reporte-fechas exige inicio, fin y tipo; tipo solo admite 7 o n. Otros valores producen 400.
- El listado de certificados por estado valida el parametro; los otros filtros conservan el parseo implementado.
- FindOne/update/remove legados pueden devolver 200 null; no presuponer 404.
- DELETE /solicitudes/:id es un rechazo logico legado sin observaciones ni correo y permanece deprecado.

Los DTOs, parametros y respuestas exactas estan en [OpenAPI](../api/openapi.json) y las historias HU-SOL/HU-TIP.

## Datos y efectos

Solicitud, Estudiante, Tipossolicitud, Estado, Idioma y Nivel en PostgreSQL. pago decimal puede serializarse como texto. Certificado, Constancia y SolicitudBeca son documentos separados en MongoDB; no existe una transaccion distribuida automatica entre ellos.

## Frontend y aceptacion

El frontend obtiene IDs de catalogos, muestra el estado devuelto y consulta de nuevo tras una mutacion. Para rechazo envia solo observaciones al endpoint dedicado. La matriz vincula cada operacion y CA con pruebas HTTP; los escenarios criticos tienen persistencia real en integracion.
