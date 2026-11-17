# Spec: Seguimiento y Evaluacion Docente

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

Docente y administrativo mantienen perfil, evidencias, cumplimiento, encuestas y resultados. Perfil/documentos/tipos/academico-administrativo/encuesta-respuestas usan API key. Otros controllers de indicadores y resultados actualmente no tienen guards; consultar la seguridad por operacion en [OpenAPI](../api/openapi.json).

## Proceso y formula de resultado almacenado

1. Crear o actualizar perfil y evidencias. aplicarDocumento suma puntajeDelta a puntajeFinal y experienciaLaboralDelta a experienciaTotal; no es un recalculo integral del perfil.
2. Configurar rubros y pesos en AcademicoAdministrativo y registrar CumplimientoDocente por modulo/docente.
3. Procesar CSV de encuesta y generar EncuestaMetricasDocente.
4. POST /perfil-docente-resultados/generar recibe moduloId y docenteId y crea/actualiza un resultado.

Formula observada en generarResultado:

~~~text
E = Number(encuesta.promedioGeneral) * 0.30; sin encuesta: 0
C = suma(Number(cumplimiento.puntaje) * Number(rubro.peso))
P = Number(perfil.puntajeFinal) * 0.30
resultadoFinal = E + C + P
~~~

Los pesos de cumplimiento vienen de datos, no se normalizan a 0.40 por el servicio. Sin perfil se responde 404. No hay redondeo explicito antes de guardar; el tipo y escala de la columna determinan su representacion persistida.

Ejemplo de caracterizacion: encuesta=80, perfil=90 y cumplimientos (100*0.10 + 50*0.10 + 75*0.20) producen 24 + 30 + 27 = 81. No declara una formula distinta aprobada por negocio.

## Detalle, ranking e indicadores

| Operacion | Medida actual |
| --- | --- |
| /perfil-docente-resultados/detalle/:moduloId/:docenteId | modulo, docenteId, promediosGrupos, cumplimiento y encuestaMetricas |
| /dashboard-docentes/ranking-docentes | Top 3 y bottom 2 de resultadoFinal almacenado del modulo activo; elimina duplicados y ordena descendente |
| /dashboard-docentes/metricas-globales | Promedio almacenado, docentes evaluados, encuestas del periodo y anterior, docentes activos |
| /dashboard-docentes/desempeno-general | Excelente >=81; bueno >=74 y <81; regular >=64 y <74; deficiente <64 |
| /dashboard-docentes/cumplimiento | AVG de puntajes de rubros 1, 2 y 3, sin ponderar |
| /dashboard-docentes/gestion-metodologica | AVG de puntajes del rubro 4, sin ponderar |
| /dashboard-docentes/valoracion-estudiantil | AVG por dimension de detalles de encuesta del periodo |
| /dashboard-docentes/perfil-profesional | Conteos globales de documentos/niveles y promedio de capacitacion |

El detalle devuelve promedio de grupo y puntajePonderado con toFixed(2), como texto. No devuelve un total por pilares ni recalcula el resultado final. Ranking/indicadores leen informacion almacenada y no garantizan que este recalculada tras cada cambio. Estas diferencias son BL-DOC-001; el frontend no debe tratar todos los indicadores como sumandos ponderados equivalentes.

## CSV de encuesta

Separador punto y coma. El parser busca la linea con encabezados que contengan Número Identificación, Estudiante o Docente. Campos observados: Número Identificación, Docente, Curso, Período, Estudiante y Comentario. Columnas cuyo encabezado inicia con un entero positivo representan IDs de pregunta.

Valores: Excelente=100, Bueno=75, Regular=50, Deficiente=25; normaliza capitalizacion. Respuestas desconocidas no contribuyen al promedio. Promedio individual es suma/numero de respuestas reconocidas, o 0 si no hay. Filas sin identificacion se omiten; un docente inexistente puede crearse con datos basicos.

La carga guarda respuestas/detalles en transaccion y actualiza metricas por docente/periodo con AVG redondeado a 2 decimales y ON CONFLICT docente/modulo. No se documenta idempotencia de importacion: repetir el CSV puede duplicar respuestas. La creacion auxiliar de docentes/modulos se ejecuta por sus servicios y no debe asumirse cubierta por la transaccion del queryRunner.

No existe limite explicito de filas o tamano en este controller; no se heredan los limites del CSV bancario. No se crea modulo inexistente: el lookup falla y revierte respuestas, aunque un docente creado por otro servicio puede permanecer. IDs de pregunta desconocidos pueden fallar por FK.

Ejemplos por endpoint: detalle devuelve "10.00", "5.00", "15.00" para los tres rubros del ejemplo. Su suma ponderada es 30, distinta del promedio sin ponderar 75 de cumplimiento para esos rubros si sus IDs fueran 1/2/3. Un rubro 4 con puntaje 80 y peso 0.10 aporta 8 al resultado, pero gestion-metodologica muestra 80. Ranking muestra 81 almacenado hasta una nueva generacion; una modificacion posterior de encuesta no cambia ese valor automaticamente. Grupo con respuestas 100 y 75 muestra "87.50"; una dimension con esas respuestas devuelve numero 87.5.

## Datos, frontend y aceptacion

Entidades de perfil/documentos/rubros/cumplimiento/encuesta/resultados se relacionan con Docente y Modulo. Los endpoints que dependen de modulo activo responden 404 si no existe.

El frontend muestra unidades, pesos y origen de cada dato, conserva decimales del contrato y refresca los resultados tras generar. Las historias por submodulo y los CA estan en la matriz. Integracion valida resultado=81, detalle como texto y persistencia/ranking del modulo; no valida una formula futura distinta.
