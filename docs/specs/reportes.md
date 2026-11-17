# Spec: Reportes Administrativos

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo y precondiciones

El administrativo consulta reportes con API key. PostgreSQL aporta solicitudes y catalogos; MongoDB aporta certificados. Son consultas sin efectos de escritura.

## Contratos y proceso

| Operacion | Resultado |
| --- | --- |
| GET /certificadosr | Objeto basico/intermedioAvanzado, cada grupo con listas digitales/fisicos |
| GET /tiempos | Lista por certificado con fechaSolicitud, fechaEmision y tiempoHoras |

1. El backend consulta certificados y completa la informacion relacional necesaria.
2. Agrupa por formato y nivel o calcula la duracion entre solicitud y emision.
3. El frontend presenta los grupos y horas recibidas sin reinterpretar el identificador del documento.

El contrato de certificados incluye numeroRegistro, tipo, alumno, idioma, nivel, periodo y numeroVoucher. periodo y numeroVoucher pueden ser null. El de tiempos incluye certificadoId, solicitudId, tipoSolicitud, periodo, formatoCertificado, fechas y tiempoHoras.

## Alternativas y reglas

Una lista vacia no equivale a error. No hay filtros o exportacion de archivo inventados por esta spec: usar solo los parametros expuestos por el controlador. Conservar la clasificacion y calculo implementados en cada servicio; no hay una regla de SLA de negocio en estas consultas.

## Aceptacion y trazabilidad

HU-RCE-001 y HU-RTI-001 enlazan CA de respuesta y seguridad, servicios e interfaces en [el indice](use-cases-index.md). Los schemas completos estan en [OpenAPI](../api/openapi.json).
