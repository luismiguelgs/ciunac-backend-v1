# Reconciliacion de la Base SDD

Comparacion historica con el inventario previo a este cierre. Habia 242 entradas: 239 rutas vigentes y 3 eliminadas; faltaban 10 operaciones. Los conteos actuales se descubren en [matriz](traceability.json), [modulos](../architecture/module-inventory.md) e [inventario API](../api/endpoints.md), no se fijan a estas cifras historicas.

## Operaciones incorporadas al inventario

- `POST /auth/forgot-password`.
- `POST /auth/reset-password`.
- `GET /certificados/aceptados`.
- `GET /certificados/firmados`.
- `GET /certificados/pendientes`.
- `PATCH /certificados/procesar-firma`.
- `POST /certificados/:id/archivo`.
- `GET /certificadosr`.
- `GET /constancias/solicitud/:solicitudId`.
- `GET /tiempos`.

## Referencias obsoletas retiradas

- `DELETE /certificados/:id`.
- `DELETE /constancias/:id`.
- `DELETE /actanotas/:id`.

Se retiran del inventario, no se agregan ni eliminan endpoints de ejecucion durante esta entrega. Menciones historicas explicativas no equivalen a contratos vigentes.

## Reglas reconciliadas

| Area                | Descripcion vigente                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Solicitudes         | ASIGNADO=2, TERMINADO=3, PAGADO=4, RECHAZADO=5, OBSERVADO=12                                          |
| Creacion documental | Guardar certificado/constancia no cambia automaticamente la solicitud a 2                             |
| Firma               | URL firmada en Mongo e impreso=true; solicitud a 3; compensacion Mongo si falla PostgreSQL            |
| Actas               | Sin cronograma obligatorio; examen TERMINADO=8, luego ACTA_GENERADA=13; participantes con solicitud 3 |
| Actas seguridad     | Lectura API key; escritura API key + JWT + gestionar_examen_ubicacion                                 |
| Logout              | API key + JWT; no revoca access tokens vigentes                                                       |
| Seguimiento docente | Formula almacenada separada del detalle y promedios del dashboard                                     |
| Publicos            | Identificados por operacion, sin atribuirles guards globales inexistentes                             |

## Entregas revisables

1. Fundamento: workflow, plantilla, IDs HU/CU/RF/CA y propuestas separadas.
2. Contratos: schemas concretos, seguridad, multipart, body inline, snapshot reproducible y paridad.
3. Dominios: historias/casos enlazados, formatos CSV, formulas, efectos externos y guia frontend.
4. Cierre automatizado: unitarias, HTTP/DTO/seguridad, integracion real aislada, e2e y evidencia por archivo/nombre de prueba.

El estado Verificado solo se obtiene en artifacts/sdd/verification.json para una ejecucion completa. Las limitaciones no se ocultan con una marca documental permanente.

## Pendientes explicitos

[Backlog](backlog.md) conserva reglas propuestas de examen, hardening, revocacion, recalculo docente, reanudacion Q10 y consistencia de fechas bancarias. El cierre inicial caracterizaba BL-VAL-001; se corrige funcionalmente el 2026-11-06 y se reemplaza su prueba de rechazo por pruebas de fecha calendario valida y persistencia. BL-PAG-001 permanece caracterizado y abierto. Las pruebas de contrato usan servicios simulados: no acreditan todas las ramas de persistencia de cada CRUD. Los escenarios criticos reales estan identificados en los CA de integracion.

No se ejecuto SQL ni se cambiaron esquemas productivos. Se conservan los cambios locales previos de Q10. Validacion visual frontend y pruebas supervisadas con proveedores reales quedan fuera de este repositorio.
