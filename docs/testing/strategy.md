# Estrategia de pruebas SDD

## Capas y evidencia

| Capa          | Comando                  | Alcance                                                                                                |
| ------------- | ------------------------ | ------------------------------------------------------------------------------------------------------ |
| Unitarias     | npm test -- --runInBand  | Suite existente; instanciacion no acredita negocio                                                     |
| Contratos     | npm run test:contract    | Cada operacion: controller, pipes, guards, interceptor y respuesta contra OpenAPI; servicios simulados |
| Integracion   | npm run test:integration | Servicios y repositorios reales; PostgreSQL/Mongo aislados; Q10/Drive/SMTP simulados                   |
| E2E enfocados | npm run test:e2e         | Configuracion aislada, sin AppModule ni .env operativo                                                 |
| Cierre        | npm run sdd:check        | Compilacion, paridad, unitarias, contratos e integracion                                               |

Los contratos prueban transporte y delegacion, no todos los caminos de un servicio simulado. Las integraciones verifican las reglas criticas siguientes. Las propuestas siguen en [backlog](../specs/backlog.md).

## Bases aisladas

[Compose](../../test/sdd/compose.yml): PostgreSQL 16.10-alpine3.22 y Mongo 8.0.15-noble. Base exclusiva ciunac_sdd_test, puertos loopback 16543/27028, almacenamiento temporal y retirada al finalizar. No se carga dotenv ni AppModule. El helper exige nombre, host, puertos y URI exactos antes de sincronizar.

Fixtures desde entidades TypeORM y schemas Mongoose compilados. synchronize:true solo en esa base temporal; produccion mantiene false. SQL id_q10 ejecutado dos veces en transaccion: longitud, nulos y unicidad; rollback final.

## Integracion critica

- Rechazo: estados vigentes, observaciones, email oficial, idempotencia y fallo SMTP.
- Solicitud manual: pendiente duplicada rechazada.
- CSV banco: pago, observacion, duplicados, lote invalido sin persistencia, reverificacion y voucher reutilizado.
- Recuperacion: SHA256, cooldown, respuesta uniforme, bcrypt, uso unico e invalidacion SMTP.
- Certificado: creacion sin transicion, carga sin URL, firma con URL Mongo y solicitud terminada; compensacion.
- Acta: snapshot, examen 8 a 13, indice unico, inmutabilidad y compensacion Mongo.
- Q10: UUID local, idempotencia, conflicto, respuesta invalida y persistencia ante matricula fallida.
- Alumno local: POST/PATCH HTTP con servicios y repositorios reales, fechas validas/imposibles/null/ausentes y conservacion del dia en procesos separados UTC/America-Lima.
- Swagger alumno nuevo: requests Q10 minimos y nulls, ejemplos de alta, nombre de upload opcional, enlaces de respuesta y los cuatro codigos 502; comparacion contra la validacion HTTP real.
- Docentes: formula 81, detalle textual ponderado, persistencia y ranking.

## Trazabilidad y cierre

[traceability.json](../specs/traceability.json) relaciona HU, CU, requisito, CA, operationId, implementacion y archivo/nombre de prueba. Cada operacion tiene HTTP y SEC; reglas criticas tienen INT.

artifacts/sdd/verification.json solo declara Verificado cuando todas las etapas aprueban y las pruebas exigidas aparecen aprobadas en el archivo y nombre exactos de esa ejecucion. Excluye pruebas "should be defined" y registra huella SHA256 de las fuentes, que no deben cambiar durante el cierre. Versionar una story no equivale a verificarla. La cobertura de operaciones no equivale a cobertura total de ramas.

Para cambios: actualizar spec/metadata, compilar, exportar API, regenerar docs, revisar diff y ejecutar cierre. GitHub Actions publica snapshots, diferencias y resultados incluso ante fallo. Docker debe estar disponible; los puertos de prueba deben estar libres.

La implementacion y validacion visual frontend siguen pendientes en su repositorio.
