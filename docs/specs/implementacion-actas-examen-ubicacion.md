# Implementacion SDD: Actas de Examen de Ubicacion

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS); el alcance original con cronograma permanece como propuesta BL-EXU-001.

## Entrada y seguridad

POST /actasexamenubicacion recibe solo { "examenId": 123 }. Requiere API key, JWT y gestionar_examen_ubicacion. El controlador entrega al servicio el usuario id/email/rol desde JWT.

## Secuencia implementada

1. Validar DTO y buscar acta previa por examenId.
2. Consultar examen con estado, aula, docente e idioma; devolver 404 si no existe.
3. Exigir estadoId=8 (TERMINADO). No se exige cronograma.
4. Leer detalles activos y solicitudes en lote.
5. Validar resultado completo, nota, terminado, tipo de solicitud 7, estado de solicitud 3, estudiante/idioma y voucher.
6. Insertar fotografia MongoDB; normalizar colision 11000 a 409 ACTA_YA_EXISTE.
7. Actualizar examen a estadoId=13 y guardar actaId.
8. Si falla PostgreSQL, compensar eliminando solo el acta insertada y registrar cualquier fallo de compensacion.
9. Consultar documentos nuevos o historicos por GET; PATCH/DELETE responden ACTA_INMUTABLE.

## Datos y compatibilidad

La entidad actual de examen no contiene cronogramaId. El documento agrega trazabilidad sin transformar los historicos. La inicializacion del modelo asegura sus indices. No hay migracion productiva adicional incluida en el cierre documental.

## Verificacion y propuestas

HU-EXU-007/008, sus CA, los tests unitarios existentes y las pruebas de integracion SDD acreditan el alcance actual. No equivalen al plan anterior de estados resueltos por catalogo o de relacion examen-cronograma; esas propuestas se mantienen en [backlog](backlog.md).
