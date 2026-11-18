# Diagnostico de registro Q10

Contrato del backend v1 para `POST /q10/estudiantes`. El portal no se modifica
en esta entrega. `201 COMPLETED` mantiene su estructura anterior.

## Errores

Los errores HTTP incluyen `statusCode`, `code`, `message` controlado,
`operationId`, `stage`, `origin` (`request`, `local`, `q10`),
`validationErrors: [{field, rules}]` y `retryAllowed: false`.
`X-Operation-Id` se devuelve tambien como header, incluido en respuestas exitosas.
Los identificadores existentes `estudianteId`/`idQ10` se conservan en respuestas
parciales; nunca se incluyen en los logs.

| HTTP | code | Significado |
| --- | --- | --- |
| 400 | Q10_INVALID_JSON | JSON malformado; no se invoco Q10 |
| 400 | Q10_REQUEST_VALIDATION_FAILED | Reglas DTO o propiedades no permitidas |
| 400 | Q10_LOCAL_VALIDATION_FAILED | Catalogos efectivos incompatibles |
| 400 | Q10_STUDENT_CREATION_REJECTED | Q10 respondio 4xx al POST de creacion |
| 401 | Q10_UNAUTHORIZED | API key ausente o invalida |
| 413 | Q10_REQUEST_TOO_LARGE | JSON mayor al limite de 100 KB del parser |
| 409 | Q10_ID_CONFLICT / Q10_ID_ALREADY_LINKED | Conflicto local despues de creacion remota |
| 502 | Q10_PERIOD_LOOKUP_FAILED | HTTP, transporte, JSON o periodo invalido; no se envio alta |
| 502 | Q10_UNAVAILABLE | Transporte o respuesta remota 5xx/no esperada; escritura incierta |
| 502 | Q10_CREATED_INVALID_RESPONSE | Respuesta exitosa sin Codigo_estudiante valido |
| 502 | Q10_CREATED_LOCAL_SYNC_FAILED | Fallo local despues de creacion remota |
| 502 | Q10_CREATED_PROGRAM_PENDING | Inscripcion o matricula no confirmada |
| 500 | Q10_INTERNAL_ERROR | Fallo inesperado; revisar etapa y efectos del log |

Las reglas locales son `FACULTY_NOT_FOUND`, `SCHOOL_NOT_FOUND`,
`SCHOOL_FACULTY_MISMATCH`, `SCHOOL_UNCLASSIFIED` y `SCHOOL_TYPE_MISMATCH`.
Las reglas DTO son nombres fijos de class-validator; una propiedad desconocida
se representa como `field: unknown`, `rules: [whitelistValidation]`.
No se extraen reglas ni motivos de mensajes libres de Q10: ante un rechazo
remoto sin contrato estructurado verificado, `validationErrors` queda vacio.

## Coordinacion pendiente con portal

El clasificador actual solo admite Q10_ID_ALREADY_LINKED, Q10_ID_CONFLICT y
Q10_UNAVAILABLE. Q10_STUDENT_CREATION_REJECTED acaba como UNRECOGNIZED.
Ampliar su lista permitida con los codigos anteriores y leer los campos
estructurados, sin analizar ni registrar mensajes externos. Conservar el
operationId del backend junto a la correlacion local del BFF.
Como mejora compatible, el BFF puede enviar `X-Correlation-Id` UUID; el backend
lo registra solo si cumple el formato. No identifica al alumno ni da idempotencia.
El backend siempre genera su propio operationId. No reenviar automaticamente
el POST, incluidos Q10_UNAVAILABLE y los resultados parciales.

## Logs y despliegue

Cada error del endpoint emite un evento JSON `q10.student.registration.failed`
por Logger de Nest: warn para 4xx, error para 5xx, en stdout/stderr. Incluye UTC,
operationId, correlacion validada si existe, etapa, HTTP backend, upstreamStatus
cuando hay respuesta, codigo, origen y reglas permitidas. No registra cuerpos,
valores, documentos, emails, IDs personales, URLs, credenciales, tokens ni
mensajes/stack de proveedores o errores de BD. Docker captura los eventos;
la retencion y rotacion dependen del logging driver del despliegue.

Efectos `remoteStudent`, `localStudent`, `program`: `not_attempted`, `confirmed`,
`unknown`. `unknown` no autoriza repetir la escritura. Un 4xx remoto tampoco
demuestra que no existiera un alumno de un intento anterior.

1. Comparar commit/digest del VPS con la version revisada antes de desplegar.
2. Ejecutar build, unitarias, HTTP, contratos y SDD con bases aisladas.
3. Desplegar solo con autorizacion, sin migraciones ni limpieza de datos.
4. En pruebas, comprobar invalidacion DTO, periodo fallido, rechazo Q10 y
   efectos parciales mediante dobles; verificar header y log correlacionados.
5. Tras desplegar, observar operaciones autorizadas con
   `docker logs --since 30m backend_v1_ciunac`; no hacer altas de diagnostico.

## Evidencia y limites del incidente

La revision local de partida fue 55c94b5, backend 1.4.7. Se reprodujo que una
consulta de periodos fallida devolvia 0 y permitia el POST posterior; se corrige
deteniendo el flujo antes de escribir. Tambien se evita matricular con
Consecutivo_inscripcion=0 cuando la consulta de inscripciones no es valida.
Se conserva la seleccion por mayor Ordenamiento, sin inferir otra politica.

El evento del 17/11/2026 12:50:27 Lima corresponde a 17:50:27 UTC. No se
verificaron VPS, estado real de Q10 ni relaciones residuales de la BD del VPS.
Su causa concreta sigue pendiente. El correlationId historico no se envio al
backend: no permite correlacionarlo retrospectivamente. No hay evidencia que
atribuya el fallo al navegador o al documento reutilizado.
