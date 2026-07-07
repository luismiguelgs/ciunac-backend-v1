# HU-EXU-007: Generar acta de examen de ubicación

Plan técnico: [Implementación SDD de actas](../../implementacion-actas-examen-ubicacion.md).

## Historia

**Como** administrativo autorizado, **quiero** generar el acta definitiva enviando únicamente el identificador del examen, **para** conservar una evidencia íntegra y trazable de sus resultados y pagos.

## Entrada

```http
POST /actasexamenubicacion
```

```json
{
  "examenId": 123
}
```

## Precondiciones

- El examen existe y está `CERRADO`.
- Tiene al menos un participante activo.
- Todos los participantes tienen nota, nivel, ciclo y `terminado=true`.
- Cada participante tiene `solicitudId` y `numeroVoucher` válidos.
- No existe un acta para el mismo `examenId`.

## Criterios de aceptación

- Dado un examen completo, cuando se envía su `examenId`, entonces el backend obtiene todos los datos desde PostgreSQL y crea el acta en `actas_examen_ubicacion`.
- El documento incluye examen, cronograma, aula, docente, idioma y participantes con estudiante, nota, nivel, ciclo, solicitud y voucher.
- Dado un participante sin solicitud o voucher, cuando se intenta generar, entonces responde `409 Conflict` y no guarda un documento parcial.
- Dado un examen inexistente, cuando se intenta generar, entonces responde `404 Not Found`.
- Dada un acta ya existente, cuando se repite la petición, entonces responde `409 ACTA_YA_EXISTE` con referencia al acta.
- Dada una generación exitosa, el examen cambia a `ACTA_GENERADA` y el acta queda inmutable.

## Rutas existentes

- `POST /actasexamenubicacion`
- `GET /actasexamenubicacion`
- `GET /actasexamenubicacion/:id`
- `PATCH /actasexamenubicacion/:id` — legado y deprecado.
- `DELETE /actasexamenubicacion/:id` — legado y deprecado.

## Reglas y dependencias

- El backend obtiene desde la tabla `estados` el ID numérico de `ACTA_GENERADA` con referencia `EXAMEN_UBICACION` y lo guarda en `examenes_ubicacion.estado_id`; no usa un ID fijo.
- El DTO público solo acepta `examenId`; cualquier otro campo es rechazado por `forbidNonWhitelisted`.
- MongoDB aplica un índice único sobre `examenId`.
- `PATCH` y `DELETE` responden `409 ACTA_INMUTABLE` para actas publicadas.
- Si falla el cambio de estado PostgreSQL después de insertar, se compensa el documento todavía no publicado.
- La creación y consulta permanecen en las rutas existentes del controller de actas.
