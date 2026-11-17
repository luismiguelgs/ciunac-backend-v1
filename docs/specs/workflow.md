# Proceso Spec-Driven Development

Version: 1.0. Responsable: equipo tecnico CIUNAC. Alcance: backend y contratos de integracion frontend.

## Ciclo de trabajo

1. Identificar el resultado de negocio y registrar una historia HU, caso CU, requisito RF y criterios CA con IDs estables.
2. Describir actores, precondiciones, flujo principal, alternativas, persistencia, efectos externos y responsabilidades frontend/backend usando [la plantilla](spec-template.md).
3. Contrastar la spec AS-IS con controller, DTO, service, entity/schema y pruebas. Las reglas deseadas distintas se registran en [backlog](backlog.md), sin atribuirlas al backend actual.
4. Editar contratos de Swagger cuando cambian inputs, respuestas, errores, seguridad o archivos. La metadata no cambia la autorizacion ni la validacion de ejecucion.
5. Asociar cada operacion y criterio con pruebas identificadas. Crear fixtures que demuestren comportamiento; una prueba de instanciacion no acredita un criterio.
6. Ejecutar build, exportacion API, generacion documental y sdd:check. Revisar los diffs antes de integrar.
7. Entregar el contrato y la [guia frontend](../frontend/integration.md), junto con limitaciones y cambios de compatibilidad.

## Estados y evidencias

| Estado | Condicion |
| --- | --- |
| Borrador | Necesidad capturada; reglas sin contrastar |
| Especificado | Contratos y criterios completos y revisados |
| Implementado | Existe comportamiento en el codigo referenciado; puede faltar evidencia ejecutada |
| Verificado | Todos los criterios de ese alcance superaron las pruebas asociadas en la ejecucion reportada |

La matriz versionada permanece en Implementado. El estado Verificado es evidencia de una ejecucion concreta y se consulta en artifacts/sdd/verification.json, junto con resultados Jest y el estado de Git. No se mantiene una marca permanente de exito que sobreviva a cambios de codigo.

## Fuentes y mantenimiento

- flows.json contiene la narracion y asignacion de casos; traceability.json, historias, inventarios y OpenAPI son artefactos derivados.
- Actualizar metadata, specs y pruebas en la misma entrega. Mantener los IDs existentes de HU-EXU.
- Las pruebas HTTP aislan servicios para verificar controllers/guards/pipes. Las pruebas de integracion mantienen reales los servicios y la persistencia, simulando solo Q10/Drive/SMTP.
- Las limitaciones de negocio conocidas no se corrigen por inferencia documental. Requieren una propuesta y criterios propios.
- El alcance frontend describe interacciones y responsabilidades; la interfaz visual necesita validacion en su repositorio.
