# Spec: Conciliacion de Pagos Bancarios

Version 1.0. Responsable: equipo tecnico CIUNAC. Estado: Implementado (AS-IS).

## Objetivo, actores y precondiciones

El administrador de recaudo importa un CSV o reverifica pagos con API key y PostgreSQL. No existe una llamada directa al banco.

## Contrato CSV

POST /pagos-banco/upload recibe multipart con campo file. Se admite extension .csv o mimetype text/csv, hasta 10 MB y 50 000 filas. Separador: punto y coma. Se normalizan encabezados antes de validar.

| Columna | Obligatoria | Regla |
| --- | --- | --- |
| n_voucher | Si | Texto no vacio |
| monto | Si | Positivo, maximo dos decimales; coma o punto decimal |
| fecha_efectiva | Si | Fecha real YYYYMMDD |
| fecha_pago | No | Fecha real YYYYMMDD cuando existe |
| dni_codigo, alumno, voucher_restante, archivo | No | Metadatos de la fila |

Ejemplo:

~~~csv
n_voucher;monto;fecha_efectiva;fecha_pago;alumno
V-001;50.00;20261001;20261001;Ana Perez
~~~

## Flujo y reglas observadas

1. Leer y validar archivo completo antes de persistir; una fila invalida rechaza el archivo con 400, totalErrores, erroresOmitidos y lista de errores (maximo 100 reportados).
2. Ejecutar la carga y conciliacion en transaccion PostgreSQL.
3. Identidad del pago: voucher + fecha efectiva. Un duplicado exacto se omite; el mismo voucher con otra fecha es un pago distinto.
4. Asociar solicitudes por voucher. Para solicitud NUEVO=1, comparar monto en centimos y fechaPago contra fecha efectiva.
5. Coincidencia cambia la solicitud a PAGADO=4. Discrepancia cambia a OBSERVADO=12 y agrega observaciones explicando monto/fecha, sin duplicar el texto ya presente.
6. Las solicitudes con estados ya gestionados conservan el estado segun el servicio; el pago puede quedar verificado sin repetir la comparacion de solicitud nueva.
7. Una solicitud nueva que reutiliza un voucher/fecha de un pago verificado queda OBSERVADO=12.
8. POST /pagos-banco/reverify vuelve a evaluar pendientes y detecta reutilizacion. GET admite filtro periodo.
9. El CRUD individual valida la clave de pago y puede responder 409 por duplicado.

## Respuestas, errores y datos

Carga y reverificacion devuelven message y resumen con contadores concretos definidos en [OpenAPI](../api/openapi.json). Errores de persistencia se convierten a 500 controlado y la transaccion evita escrituras parciales.

PagosBanco y Solicitud se almacenan en PostgreSQL. periodo se deriva como YYYY-MM de fecha efectiva. La verificacion bancaria y el estado administrativo son conceptos distintos; no inferir aprobacion del tramite a partir de verificado.

Limitacion BL-PAG-001: las fechas se crean como Date UTC y TypeORM las serializa a columna date segun TZ del proceso. Fuera de UTC pueden retroceder un dia; una prueba con America/Lima reproduce 2026-10-01 -> 2026-09-30. Esto puede afectar duplicados y reverificacion. El cierre usa UTC explicitamente, sin cambiar configuracion productiva ni ocultar este pendiente.

## Frontend, criterios y evidencia

El frontend envia FormData sin forzar Content-Type JSON, presenta contadores y errores de fila y refresca las solicitudes afectadas. HU-PAG y sus CA enlazan pruebas HTTP. La integracion prueba persistencia, duplicado exacto, discrepancia, rollback y reverificacion con repositorios reales.
