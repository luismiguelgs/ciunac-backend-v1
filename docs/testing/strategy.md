# Estrategia de Testing

## Objetivo

Alinear pruebas con specs de negocio y contratos tecnicos. Cada caso de uso importante debe tener pruebas que cubran flujo feliz, errores de validacion, errores de permisos y persistencia.

## Comandos

| Objetivo | Comando |
| --- | --- |
| Unit tests | `npm run test` |
| Test especifico | `npx jest src/path/to/file.spec.ts` |
| Watch | `npm run test:watch` |
| Coverage | `npm run test:cov` |
| E2E | `npm run test:e2e` |
| Build | `npm run build` |

## Piramide recomendada

- Unit: services, guards, transformaciones, calculos y validaciones de negocio.
- Integration: controllers con providers mockeados o bases de prueba cuando aplique.
- E2E: flujos criticos completos con Supertest.

## Trazabilidad spec -> pruebas

| Spec | Unit | Integration | E2E |
| --- | --- | --- | --- |
| Authentication | `AuthService`, guards, permisos | register/login/profile | login -> profile -> permiso |
| Solicitudes administrativas | filtros, estados, fechas | solicitud + documento | solicitud -> constancia/certificado |
| Pagos banco | parseo CSV, reverificacion | upload CSV | upload -> list -> reverify |
| Examen ubicación | rangos, elegibilidad, cálculo, cierre, consolidación, duplicidad y compensación | cronograma -> examen -> detalle -> resultado -> acta | examen cerrado -> acta -> consulta; segundo intento `409` |
| Seguimiento docente | resultados y dashboard | perfil -> documento -> resultado | CSV encuesta -> dashboard |
| Q10 | mock Q10 | endpoints con API key | horarios/cursos |
| Uploads y mailer | resolver carpeta, transporter | mocks Drive/SMTP | upload/mail basico |

## Casos transversales obligatorios

- API key ausente o invalida.
- JWT ausente, expirado o invalido.
- Usuario sin permiso.
- DTO con campos no permitidos.
- Recurso inexistente.
- Error de integracion externa.
- CSV vacio, invalido y valido.

## Matriz mínima: examen de ubicación

- Rangos: límites 0 y 100, mínimo mayor al máximo, solapamientos y nota sin coincidencia.
- Cronograma y examen: referencias inexistentes, código duplicado y transiciones inválidas.
- Participantes: solicitud distinta de tipo 7, estado distinto de 4, voucher vacío, idioma incompatible y asignación duplicada.
- Resultados: nota válida, fuera de rango, cálculo único de nivel/ciclo y detalle inactivo.
- Cierre: examen vacío, participante pendiente y cierre exitoso.
- Acta: DTO con solo `examenId`, examen inexistente, estado distinto de `CERRADO`, participante incompleto, creación exitosa e índice único.
- Inmutabilidad: `PATCH` y `DELETE` de acta publicada responden `409 ACTA_INMUTABLE`.
- Consistencia: fallo MongoDB, fallo PostgreSQL posterior a la inserción y compensación del documento no publicado.
- Seguridad: API key, JWT, permiso administrativo y campos no permitidos.

## Criterio de salida para nuevas features

Una feature esta lista cuando:

1. Tiene spec actualizado.
2. Tiene endpoint documentado.
3. Tiene DTO validado.
4. Tiene prueba unitaria del service.
5. Tiene prueba de controller o e2e si expone flujo critico.
6. `npm run build` pasa.
