# Reglas de Comisión

Explicación detallada de cómo se calculan las comisiones en ATENEA.

---

## 1. Conceptos Base

### 1.1 Precio Base

Monto del producto sin descuentos ni recargos.

```
PrecioBase = categoria.precioCliente (tipoConsumo = 'cliente')
           o categoria.precioChica (tipoConsumo = 'chica')
```

### 1.2 Precio Final

Precio después de aplicar:

1. Recargo por crédito
2. Descuentos (monto o porcentaje)
3. Cortesía (→ $0)

```
PrecioFinal = PrecioBase + RecargoCredito - Descuentos
```

### 1.3 Comisión Total

Monto a dividir entre las chicas.

---

## 2. Tabla de Reglas

### 2.1 Por Tipo de Consumo

| Categoría | Tipo | Comisión |
|----------|------|----------|
| Trago | Cliente | 0% |
| Trago | Chica | 100% de comisión categor |
| Botella | Cliente | % configurable |
| Botella | Chica | 100% de comisión categoría |

### 2.2 Resumen rápido

```
SI isAfterhour = true → Comisión = 0

SI categoria.tipo = 'trago' Y tipoConsumo = 'cliente'
  → Comisión = 0

SI categoria.tipo = 'botella' Y tipoConsumo = 'cliente'
  → Comisión = categoria.comision

SI tipoConsumo = 'chica'
  → Comisión = categoria.comisionChica
```

---

## 3. Ejemplos Detallados

### 3.1 Trago para Cliente

```
Categoría: Vodka (trago)
Precio: $12,000
Comisión: $3,000
Tipo consumo: Cliente

RESULTADO:
PrecioFinal: $12,000
ComisiónTotal: $0
Casa: $12,000
```

**Regla:** Los tragos para cliente NO generan comisión.

---

### 3.2 Botella para Cliente con 1 Chica

```
Categoría: Grey Goose (botella)
Precio: $85,000
Comisión: $20,000
Tipo consumo: Cliente
Chica1: María

RESULTADO:
PrecioFinal: $85,000
ComisiónTotal: $20,000
Comisión María: $20,000
Casa: $65,000
```

---

### 3.3 Botella para Cliente con 2 Chicas

```
Categoría: Grey Goose (botella)
Precio: $85,000
Comisión: $20,000
Tipo consumo: Cliente
Chica1: María
Chica2: Laura

RESULTADO:
PrecioFinal: $85,000
ComisiónTotal: $20,000
Comisión María: $10,000
Comisión Laura: $10,000
Casa: $65,000
```

**Regla:** La comisión se divide entre las chicas.

---

### 3.4 Botella con Chicas Adicionales

```
Categoría: Blue Label (botella)
Precio: $150,000
Comisión: $35,000
maxChicasBottella: 2
Chica1: María
Chica2: Laura
Adicionales: 1

RESULTADO:
ComisiónBase: $35,000
Adicional: comisionAcompananteBotella = $5,000
ComisiónTotal: $40,000
Casa: $110,000
```

---

### 3.5 Chica Consume

```
Categoría: Vodka (trago)
Precio cliente: $12,000
Precio chica: $6,000
Comisión: $3,000
Tipo consumo: Chica
Chica: María

RESULTADO:
PrecioFinal: $6,000
ComisiónTotal: $3,000 (para María)
Casa: $3,000
```

**Regla:** La chica consume con descuento y genera comisión completa para ella.

---

### 3.6 Trago en Afterhour

```
Categoría: Vodka (trago)
isAfterhour: true
Precio: $12,000
Tipo consumo: Cliente

RESULTADO:
PrecioFinal: $12,000
ComisiónTotal: $0
Casa: $12,000
```

**Regla:** Afterhour no paga comisión.

---

## 4. Descuentos y Recargos

### 4.1 Descuento por Porcentaje

```
PrecioBase: $100,000
Descuento: 10%

PrecioFinal = $100,000 - ($100,000 × 0.10)
PrecioFinal = $90,000
```

### 4.2 Descuento por Monto

```
PrecioBase: $100,000
DescuentoMonto: $15,000

PrecioFinal = $100,000 - $15,000
PrecioFinal = $85,000
```

### 4.3 Recargo por Crédito

```
PrecioBase: $100,000
Recargo Crédito: $2,000
Medio: Crédito

PrecioFinal = $100,000 + $2,000
PrecioFinal = $102,000
```

### 4.4 Combinación

```
PrecioBase: $100,000
Recargo: $2,000
Descuento: 10%
Medio: Crédito

Paso 1: +$2,000 = $102,000
Paso 2: -10% = $91,800
PrecioFinal = $91,800
```

---

## 5. Cortesía

Cuando cortesia = true:

```
PrecioFinal = $0
Recargo = $0
Comisión = $0
```

**Casos de uso:**
- Consumo para amigos
- Consumo para staff
- Promociones especiales

---

## 6. Distribución de Comisión

### 6.1 Casos

| Situación | Distribución |
|----------|------------|
| 1 chica | 100% para ella |
| 2+ chicas (cliente) | División equitativa |
| Chica recibe específica | Especificada por campo |

### 6.2 División Equitativa

```
ComisiónTotal: $20,000
Chicas: María, Laura

María: $20,000 / 2 = $10,000
Laura: $20,000 / 2 = $10,000
```

### 6.3 Redondeo

Se usa redondeo hacia abajo para evitar centavos.

```
ComisiónTotal: $10,000
Chicas: 3

$10,000 / 3 = $3,333.33
→ Redondeado: $3,333 para María
            $3,333 para Laura
            $3,334 para Ana
Total: $10,000 ✓
```

---

## 7. Validaciones

### 7.1 Chica Disponible

Una chica no puede estar en 2 comandas activas simultáneas.

```
VALIDACIÓN:
  SI chica está en comanda activa del día
    Y chica no está liberada
  → ERROR: "Chica está ocupada"
```

### 7.2 Mínimo de Chicas para Botella

```
VALIDACIÓN:
  Botellas requieren mínimo 2 chicas

SI cantidadChicas < 2
  → ERROR: "Para botellas se requieren al menos 2 chicas"
```

### 7.3 Máximo de Chicas

```
CONFIG: maxChicasBottella = 2

VALIDACIÓN:
  SI adicionales > maxChicasBottella
  → ERROR: "Máximo {maxChicasBottella} chicas adicionais permitidas"
```

---

## 8. Cálculo en Código

```typescript
// lib/businessRules.ts

function calculateComision(input: CommissionInput): CommissionResult {
  // 1. Calcular recargo por crédito
  let recargoCredito = 0
  if (medioPago === 'credito' && !cortesia) {
    recargoCredito = tipoConsumo === 'chica'
      ? recargoCreditoChica
      : recargoCreditoCliente
  }

  // 2. Calcular precio final
  let precioFinal = precioBase + recargoCredito
  if (!cortesia) {
    if (descuentoMonto) precioFinal -= descuentoMonto
    if (descuentoPorcentaje) precioFinal -= precioFinal * (descuentoPorcentaje / 100)
  }
  precioFinal = Math.max(0, Math.round(precioFinal))

  // 3. Calcular comisión
  if (isAfterhour) {
    return { precioFinal, comisionTotal: 0, ... }
  }

  if (categoriaTipo === 'trago' && tipoConsumo === 'cliente') {
    // Tragos para cliente = sin comisión
    comisionTotal = 0
  } else if (categoriaTipo === 'botella' && tipoConsumo === 'cliente') {
    // Botella = comisión ÷ chicas
    comisionTotal = comisionBotella
  } else if (tipoConsumo === 'chica') {
    // Chica consume = comisión completa
    comisionTotal = comisionChicaCategoria
  }

  // 4. Distribuir entre chicas
  if (comisionTotal > 0 && multipleChicas) {
    comisionChica1 = comisionTotal / cantidadChicas
    comisionChica2 = comisionTotal - comisionChica1
  }

  return { precioFinal, comisionTotal, comisionChica1, comisionChica2, recargoCredito }
}
```

---

## 9. Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    ALGORITMO DE COMISIÓN                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  INICIO → PrecioBase, Categoria, TipoConsumo                 │
│           │                                                  │
│           ▼                                                  │
│  ┌─────────────────┐                                        │
│  │ isAfterhour?    │                                        │
│  └────────┬────────┘                                        │
│           │                                                  │
│     SÍ    │    NO                                            │
│           ▼                                                  │
│      COMISIÓN = 0              ┌────────────────────┐      │
│                                 │ categoriaTipo='trago│      │
│                                 └─────────┬──────────┘      │
│                                           │                 │
│                                     SÍ   │   NO            │
│                                           ▼                 │
│                                    ┌──────────────┐        │
│                                    │ tipo='cliente│        │
│                                    └──────┬───────┘        │
│                                          │                 │
│                                    SÍ    │   NO            │
│                                          ▼                 │
│                                    ┌──────────────┐        │
│                                    │  TRAGO      │        │
│                                    │ COMISIÓN=0  │        │
│                                    └──────────────┘        │
│                                          │                 │
│                                    NO   │   SÍ            │
│                                          ▼                 │
│                                    ┌──────────────────┐   │
│                                    │  BOTELLA/CHICA  │   │
│                                    │ COMISIÓN>0       │   │
│                                    └──────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Referencias

- [Modelo de Negocio](./01-modelo-negocio.md)
- [Referencia de Configuración](./../reference/03-configuracion.md)
- [businessRules.ts](../../lib/businessRules.ts)

---

*Última actualización: Abril 2026*