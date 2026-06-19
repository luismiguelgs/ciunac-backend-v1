# ADR 0001: Monolito Modular NestJS Orientado a Dominios

## Estado

Aceptado.

## Contexto

El backend CIUNAC agrupa multiples procesos academicos y administrativos. El codigo actual ya esta organizado en modulos NestJS por dominio bajo `src/modules`.

## Decision

Mantener el estilo de monolito modular orientado a dominios.

## Consecuencias

- Los cambios nuevos deben crearse dentro del dominio correspondiente.
- La logica de negocio vive en services, no en controllers.
- Servicios compartidos deben ubicarse en `src/shared`.
- Integraciones externas deben encapsularse en modulos dedicados.
- Si un dominio crece demasiado, se evaluara separarlo por bounded context antes de convertirlo en microservicio.
