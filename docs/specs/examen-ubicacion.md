# Spec SDD: Examenes de Ubicacion (AS-IS)

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado con limitaciones explicitas.

## Objetivo, actores y precondiciones

El administrativo mantiene rangos, cronogramas, examenes y participantes y genera un acta unica del examen terminado. PostgreSQL contiene datos transaccionales y MongoDB la fotografia del acta.

## Seguridad y contratos actuales

Los CRUD de cronograma, examen, calificaciones y detalles requieren API key. En actas, GET conserva API key; POST/PATCH/DELETE exige ademas JWT y gestionar_examen_ubicacion.

| Paso | Operacion actual | Responsabilidad |
| --- | --- | --- |
| Rangos | /calificacionesubicacion | CRUD de idioma/nivel/ciclo y rango |
| Cronograma | /cronogramaubicacion | CRUD independiente del examen |
| Examen | /examenesubicacion | Crear/consultar/actualizar examen con idioma, docente, aula y estado |
| Participantes | /detallesubicacion | Guardar nota, nivel, calificacion y terminado recibidos del cliente |
| Cierre | PATCH /examenesubicacion/:id | Guarda estadoId; no valida integralmente los participantes |
| Acta | POST /actasexamenubicacion | Recibe solo examenId y consolida desde PostgreSQL |
| Consulta | GET /actasexamenubicacion y /:id | Lista y consulta documentos actuales e historicos |

## Reglas implementadas

- Examen no tiene cronogramaId obligatorio ni relacion con cronograma. La generacion actual no exige cronograma.
- Generar acta requiere examen.estadoId=8 (TERMINADO), relaciones estado/aula/docente/idioma completas y al menos un detalle activo.
- Cada detalle requiere terminado=true, nota 0-100, estudiante, nivel, calificacion y ciclo.
- Cada solicitud debe existir, tener tipoSolicitudId=7 y estadoId=3, estudiante e idioma compatibles y numeroVoucher no vacio. PAGADO=4 es intermedio y no habilita el acta.
- El acta conserva examenId, datos descriptivos, generadoPor desde JWT y participantes con detalle, estudiante, solicitud, voucher y resultado.
- MongoDB asegura unicidad parcial por examenId para conservar lectura de documentos historicos sin ese campo.
- Tras guardar el acta, PostgreSQL cambia el examen a estadoId=13 (ACTA_GENERADA) y conserva actaId.
- Si falla la actualizacion PostgreSQL se elimina el documento MongoDB recien insertado como compensacion. Un fallo de compensacion queda registrado.
- PATCH y DELETE de actas son deprecados y siempre responden 409 ACTA_INMUTABLE; no hay respuesta exitosa en esas rutas.
- Eliminar un examen con detalles vinculados responde 409 EXAMEN_CON_DETALLES.

## Limitaciones y propuestas separadas

Los CRUD actuales no implementan cobertura 0-100/solapamientos, calculo automatico de nivel/ciclo, elegibilidad integral al incorporar ni maquina PROGRAMADO/EN_CURSO/CERRADO. Son BL-EXU-001 a 004 del [backlog](backlog.md), no requisitos ya implementados.

## Errores de actas

400 para DTO u ObjectId invalido; 404 EXAMEN_NO_ENCONTRADO o ACTA_NO_ENCONTRADA; 409 EXAMEN_NO_CERRADO (nombre historico, requiere TERMINADO), PARTICIPANTES_INCOMPLETOS, ACTA_YA_EXISTE o ACTA_INMUTABLE; 500 para configuracion/persistencia controlada.

## Datos y frontend

Examenesubicacion, Detallesubicacion, Calificacionesubicacion, Solicitud y catalogos se consultan en PostgreSQL. ActaExamenUbicacion es inmutable en MongoDB. El frontend envia los resultados que hoy exige el detalle y solo examenId al generar acta; no debe enviar la fotografia completa.

## Criterios y trazabilidad

Se mantienen HU-EXU-001 a 008 y sus IDs. Sus historias describen ahora el alcance actual y separan limitaciones. [El indice](use-cases-index.md) y traceability.json enlazan operaciones, servicios, datos y CA. La integracion comprueba generacion, duplicado, bloqueo de cambios y compensacion con persistencia real.
