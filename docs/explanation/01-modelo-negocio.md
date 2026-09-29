# Modelo de Negocio Night Club

Explicación conceptual de cómo funciona un nightclub y el rol del sistema ATENEA.

---

## 1. El Modelo Tradicional

### 1.1 Concepto básico

Un nightclub es un establecimiento donde:

- Los clientes pagan por consumir bebidas
- Las chicas (trabajadoras) generan comisiones por cada consumo
- El establecimiento obtiene la diferencia entre precio y comisión

### 1.2 Flujo de dinero simplificado

```
CLIENTE PAGA → $100,000 (botella)
                    │
                    ▼
              ─────────────
              │ CAJA │
              ─────────────
                    │
         ┌──────────┴──────────┐
         ▼                     ▼
   ┌───────────┐        ┌───────────┐
   │ CASA     │        │ CHICA(S)  │
   │ $60,000  │        │ $40,000  │
   └───────────┘        └───────────┘
```

---

## 2. Actor y Roles

### 2.1 El Cliente

Persona que llega al club, consume bebidas y paga.

**Características:**
- Puede consumir solo o acompañado de chica(s)
- Paga por su consumo (cliente) o el de su acompanhante
- Recibe un correlativo diario (C1, C2...)

### 2.2 La Chica

Trabajadora que acompaña clientes.

**Características:**
- Recibe comisión por botella(s) que acompaña
- Puede estar disponible u ocupada
- No paga por sus propios consumos (o paga con descuento)

### 2.3 El Establecimiento

La casa (el club).

**Características:**
- Cobra los consumos
- Paga las comisiones a las chicas
- Obtiene la ganancia

---

## 3. Tipos de Consumo

### 3.1 Trago para Cliente

| Concepto | Monto |
|----------|-------|
| Precio cliente | $12,000 |
| Comisión | $0 |
| Ganancia casa | $12,000 |

**Regla:** Los tragos no generan comisión para las chicas.

---

### 3.2 Botella para Cliente

| Concepto | Monto |
|----------|-------|
| Precio cliente | $100,000 |
| Comisión (40%) | $40,000 |
| Ganancia casa | $60,000 |

**Regla:** La comisión se divide entre las chicas asignadas.

---

### 3.3 Chica Consume

| Concepto | Monto |
|----------|-------|
| Precio chica | $6,000 |
| Comisión | $6,000 |
| Ganancia casa | $0 |

**Regla:** El consumo de la chica no genera ganancia.

---

## 4. Afterhour

### 4.1 Concepto

Período especial donde la casa consume sin pagar comisión.

**Horario típico:** Después de las 4:00 AM (configurable)

### 4.2 Ejemplo

| Hora | Tipo | Precio | Comisión | Casa |
|------|------|--------|----------|------|
| 22:00 | Trago | $12,000 | $3,000 | $9,000 |
| 05:00 | Trago | $12,000 | $0 | $12,000 |

---

## 5. El Sistema de Correlativos

### 5.1 Qué es

Identificador secuencial para clientes del día.

**Formato:** C1, C2, C3... Cn

### 5.2 Propósito

- Identificar rápidamente cada cliente
- Asociar comandas a un cliente
- Facilitar el cierre de cuenta

### 5.3 Reinicio diario

El correlativo se reinicia cada día a las 00:00.

---

## 6. Modelo de Turnos

### 6.1 Turno de trabajo

Período donde se registran comandas.

```
┌──────────────────────────────────────┐
│            TURNO                       │
│  Apertura ────────────────── Cierre   │
│    │                              │   │
│    ▼                              ▼   │
│  Fondo                      Resumen    │
│  inicial                    final     │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ Comandas durante el turno       │ │
│  └─────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 6.2 Apertura

El cajero abre con un fondo de cambio para dar vueltos.

### 6.3 Cierre

Se resume todo lo cobrado y se compara con el efectivo.

---

## 7. Sistema de Comisiones

### 7.1 Base de cálculo

| Tipo de consumo | Quién calcula |
|----------------|---------------|
| Trago | Sin comisión |
| Botella | % del precio |
| Chica consume | 100% |

### 7.2 Distribución

| Situación | División |
|----------|----------|
| 1 chica | 100% para ella |
| 2 chicas | 50% cada una |
| N chicas | Comisión ÷ N |

---

## 8. El Rol de ATENEA

### 8.1 Problema sin sistema

- Correlativos manuales se confuse
- Comisiones mal calculadas
- Caja con errores
- Sin trazabilidad

### 8.2 Solución con ATENEA

| Problema | Solución ATENEA |
|---------|----------------|
| Correlativos manuales | Automático por día |
| Comisiones incorrectas | Cálculo automático |
| Errores de caja | Validación en tiempo real |
| Sin trazabilidad | AuditLog completo |
| Disponibilidad chica | Tiempo real |

---

## 9. Ejemplo de Flujo Completo

```
ESCENARIO: Cliente C1 con Maria y Laura pidiendo una botella
────────────────────────────────────────────────────────────────

1. OPERADOR ABRE CLIENTE
   → Sistema crea C1

2. OPERADOR CREA COMANDA
   Categoría: Whisky 12 años (botella)
   Precio: $100,000
   Chicas: María, Laura
   Comisión: $40,000 (dividido)

3. SISTEMA CALCULA
   Precio final: $100,000
   ComisionChica1: $20,000 (María)
   ComisionChica2: $20,000 (Laura)
   Casa: $60,000

4. OPERADOR CIERRA CUENTA
   Medio: Efectivo
   Estado: pagada
   María y Laura quedan disponibles

5. REPORTE CIERRE TURNO
   Ventas: $100,000
   Comisiones: $40,000
   Neto casa: $60,000
```

---

## 10. Métricas Clave

### 10.1 KPIs del negocio

| Métrica | Cálculo |
|---------|---------|
| Ticket promedio | Ventas / Comandas |
| Comisión promedio | Comisiones / Comandas |
| Ocupación chica | Comandas / Disponible |
| Ganancia por turno | Ventas - Comisiones |

### 10.2 Análisis

- Si comisiones > 50% de ventas → Revisar precios
- Si chica sin comisiones → Asignación incorrecta
- Si caja descuadrada → Error de registro

---

## Referencias

- [Reglas de Comisión](./02-reglas-comision.md)
- [Cómo Gestionar Comandas](./../how-to/01-gestionar-comandas.md)
- [Cómo Gestionar Turno](./../how-to/02-gestionar-turno.md)

---

*Última actualización: Abril 2026*