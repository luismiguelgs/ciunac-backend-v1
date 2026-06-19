# Plantilla Spec-Driven

Usar esta plantilla para todo caso de uso nuevo o modificado.

## Objetivo funcional

Describir el resultado de negocio esperado en una o dos frases.

## Actores

- Actor principal:
- Actores secundarios:
- Sistemas externos:

## Precondiciones

- Estado previo requerido.
- Datos minimos existentes.
- Permisos o autenticacion requerida.

## Flujo principal

1. El actor inicia la accion.
2. El sistema valida entrada y permisos.
3. El sistema ejecuta la regla de negocio.
4. El sistema persiste o consulta datos.
5. El sistema responde con resultado esperado.

## Flujos alternos y errores

| Caso | Comportamiento esperado |
| --- | --- |
| Entrada invalida | Responder `400 Bad Request`. |
| No autenticado | Responder `401 Unauthorized`. |
| Sin permisos | Responder `403 Forbidden`. |
| Recurso inexistente | Responder `404 Not Found`. |
| Error externo | Responder error controlado y registrar contexto seguro. |

## Reglas de negocio

- Regla 1:
- Regla 2:
- Regla 3:

## Contratos API

| Metodo | Endpoint | Auth | Request | Response |
| --- | --- | --- | --- | --- |
| `GET` | `/recurso` | `ApiKey/JWT` | Query params | Lista de recursos |

## Datos involucrados

- Entidades TypeORM:
- Schemas Mongoose:
- DTOs:

## Integraciones externas

- Sistema:
- Entrada:
- Salida:
- Manejo de error:

## Criterios de aceptacion

- Dado..., cuando..., entonces...
- Dado..., cuando..., entonces...

## Casos de prueba sugeridos

- Unit:
- Integration:
- E2E:

## Trazabilidad

| Elemento | Referencia |
| --- | --- |
| Controller | `src/.../*.controller.ts` |
| Service | `src/.../*.service.ts` |
| DTO | `src/.../dto/*.dto.ts` |
| Entity/Schema | `src/.../entities/*.entity.ts` o `src/.../schemas/*.schema.ts` |
