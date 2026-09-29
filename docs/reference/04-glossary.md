# Glosario

Términos y definiciones del negocio Night Club.

**Audiencia:** Todos los usuarios

---

## Términos de Negocio

### Afterhour

Período fuera del horario normal de operación.

**Definición:** Tiempo donde la casa consume tragos sin pagar comisión a las chicas. Generalmente después de la hora de cierre del bar.

**Ejemplo:** Hora after = 04:00. Tragos después de las 04:00 no generan comisión.

---

### Acompañante

Chica adicional que acompaña una botella.

**Definición:** Chica que no es la principal en una comanda de botella pero recibe una parte de la comisión.

**Sinónimo:** Chica 2, acompanhante

---

### Botella

Producto de alto valor que se vende completo.

**Definición:** Bebida servida en botella entera (ej: whisky, vodka premium). Genera comisión para las chicas.

**Ejemplo:** Blue Label, Grey Goose, Hennessy

---

### Caja

Sistema de control de ingresos y egresos.

**Definición:** Registro de todos los pagos recibidos, desglosados por medio de pago.

---

### Cajero

Usuario responsable de la caja.

**Definición:** Persona que abre, opera y cierra la caja del turno.

---

### Chica

Personal femenino del nightclub.

**Definición:** Trabajadora que recibe comisiones por consumos de clientes. Puede estar disponible u ocupada.

---

### Cliente

Persona que paga por consumos.

**Definición:** Puede ser cliente nuevo (correlativo automático) o existente (cliente abierto en turno).

**Correlativo:** C1, C2, C3... (asignado automáticamente)

---

### Comanda

Registro de un consumo.

**Definición:** Producto consumido con información de precio, chica asignada, comisión y estado.

**Campos principales:**
- Categoría consumida
- Precio final
- Chica(s) asignada(s)
- Comisión generada
- Estado (activa/pagada/anulada)

---

### Comisión

Pago a las chicas por su trabajo.

**Definición:** Porcentaje o monto fijo del consumo que recibe la chica. No aplica para tragos en horario normal.

**Cálculo:**
| Tipo | Comisión |
|------|---------|
| Trago (cliente) | 0% |
| Botella (cliente) | % configurable |
| Chica consume | 100% |

---

### Correlativo

Identificador secuencial por día.

**Definición:** Número que identifica a cada cliente nuevo. Se reinicia cada día.

**Formato:** C1, C2, C3... Cn

---

### Cortesía

Consumo gratuito.

**Definición:** Consumo que no genera pago ni comisión. Generalmente para amigos o staff.

---

### Disponible

Estado de una chica que puede ser asignada.

**Definición:** Chica que no está en una comanda activa del día actual.

**Indicadores:**
- 🟢 Verde: Disponible
- 🔴 Rojo: Ocupada

---

### Turno

Jornada de trabajo.

**Definición:** Período donde se registran comandas. Tiene apertura y cierre.

**Ciclos típicos:**
- Mañana: 06:00 - 14:00
- Tarde: 14:00 - 21:00
- Noche: 21:00 - 06:00

---

### Trago

Bebida individual.

**Definición:** Bebida servida por unidad (no botella). Generalmente sin comisión para chica en horario normal.

**Ejemplo:** Cerveza, vodka, whisky (por trago)

---

## Estados

### Estado de Comanda

| Estado | Descripción |
|--------|------------|
| activa | Pendiente de pago |
| pagada | Cerrada y cobrada |
| anulada | Cancelada sin efecto |

---

### Estado de Chica

| Estado | Descripción |
|--------|------------|
| activa | Disponible para asignar |
| inactiva | No aparece en lista |

---

## Medios de Pago

| Medio | Descripción | Recargo |
|-------|------------|--------|
| Efectivo | Dinero físico | No |
| Transferencia | Pago electrónico | No |
| Débito | Tarjeta débito | No |
| Crédito | Tarjeta crédito | Sí (% configurable) |

---

## Roles de Usuario

| Rol | Descripción | Permisos |
|-----|------------|---------|
| admin | Administrador | Acceso total |
| supervisor | Supervisor | Gestión + reportes |
| caja | Cajero | Solo caja |

---

## Tipos de Categoría

| Tipo | Descripción |
|------|----------|
| trago | Bebida individual |
| botella | Botella completa |

---

## Tipos de Consumo

| Tipo | Descripción |
|------|----------|
| cliente | Pagado por el cliente |
| chica | Consumo propio de la chica |

---

## Conceptos Técnicos

### Precio Base

Monto sin descuentos ni recargos.

### Precio Final

Precio después de aplicar:
1. Recargo por crédito
2. Descuentos
3. Cortesía

### JWT

Token de autenticación.

**Definición:** Json Web Token almacenado en cookie httpOnly. Identifica al usuario logueado.

### Prisma

ORM para acceso a base de datos.

**Definición:** Herramienta que genera consultas SQL desde código TypeScript.

### PWA

Progressive Web App.

**Definición:** Aplicación web que puede instalarse en dispositivo y funcionar offline.

---

## Referencias Cruzadas

| Término | Documento relacionado |
|---------|---------------------|
| Comisiones | [Reglas de Comisión](./../explanation/02-reglas-comision.md) |
| Comandas | [Gestionar Comandas](./../how-to/01-gestionar-comandas.md) |
| Turno | [Gestionar Turno](./../how-to/02-gestionar-turno.md) |

---

*Última actualización: Abril 2026*