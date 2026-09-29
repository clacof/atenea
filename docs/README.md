# Documentación ATENEA

Sistema de documentación basado en el marco [Diátaxis](https://diataxis.fr/).

---

## Estructura de Documentación

```
docs/
├── tutorials/     Guías paso a paso para aprender
├── how-to/       Recetas para resolver problemas específicos
├── reference/    Referencia técnica (APIs, schema, configuración)
└── explanation/   Explicaciones conceptuales
```

---

## Tutorials

Para operadores nuevos que aprenden a usar el sistema.

| Documento | Descripción |
|----------|-------------|
| [Inicio Rápido para Operador](./tutorials/01-inicio-operador.md) | Primer día como operador |
| [Configuración Inicial](./tutorials/02-configuracion-inicial.md) | Setup para administradores |

---

## How-to Guides

Recetas orientadas a resolver tareas específicas.

| Documento | Descripción |
|----------|-------------|
| [Gestionar Comandas](./how-to/01-gestionar-comandas.md) | Crear, editar, cerrar, anular |
| [Gestionar Turno](./how-to/02-gestionar-turno.md) | Turno activo, clientes abiertos |
| [Gestionar Chicas](./how-to/03-gestionar-chicas.md) | Disponibilidad, asignaciones |
| [Gestionar Caja](./how-to/04-gestionar-caja.md) | Apertura, cierre, movimientos |
| [Generar Reportes](./how-to/05-generar-reportes.md) | Reportes diarios y filtrados |
| [Configurar Sistema](./how-to/06-configurar-sistema.md) | Parámetros operativos |

---

## Reference

Documentación técnica para desarrolladores.

| Documento | Descripción |
|----------|-------------|
| [API Endpoints](./reference/01-api-endpoints.md) | Referencia completa de APIs |
| [Database Schema](./reference/02-database-schema.md) | Schema Prisma documentado |
| [Configuración](./reference/03-configuracion.md) | Parámetros del sistema |
| [Glosario](./reference/04-glossary.md) | Términos y definiciones |

---

## Explanation

Explicaciones conceptuales para entender el sistema.

| Documento | Descripción |
|----------|-------------|
| [Modelo de Negocio](./explanation/01-modelo-negocio.md) | Cómo funciona un nightclub |
| [Reglas de Comisión](./explanation/02-reglas-comision.md) | Cálculo de comisiones |
| [Arquitectura](./explanation/03-arquitectura.md) | Visión técnica del sistema |

---

## Guía Rápida

### Nuevo Operador

1. Lee [Inicio Rápido para Operador](./tutorials/01-inicio-operador.md)
2. Practica con [Gestionar Comandas](./how-to/01-gestionar-comandas.md)
3. Aprende [Gestionar Turno](./how-to/02-gestionar-turno.md)

### Administrador

1. Lee [Configuración Inicial](./tutorials/02-configuracion-inicial.md)
2. Configura parámetros en [Configurar Sistema](./how-to/06-configurar-sistema.md)
3. Revisa [Modelo de Negocio](./explanation/01-modelo-negocio.md)

### Desarrollador

1. Consulta [API Endpoints](./reference/01-api-endpoints.md)
2. Revisa [Database Schema](./reference/02-database-schema.md)
3. Lee [Arquitectura](./explanation/03-arquitectura.md)

---

## Conventions

Esta documentación sigue las convenciones Diátaxis:

| Tipo | Propósito | Ejemplo |
|------|-----------|---------|
| Tutorial | Aprender | "Cómo crear tu primera comanda" |
| How-to | Hacer algo | "Cómo cerrar una cuenta" |
| Reference | Consultar | "Lista de endpoints" |
| Explanation | Entender | "Por qué se calcula así" |

---

*Última actualización: Abril 2026*