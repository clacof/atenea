# Parámetros de Configuración

Referencia completa de todos los parámetros configurables del sistema.

**Audiencia:** Administradores, desarrolladores
**Ubicación:** Tabla `ConfigGeneral` en base de datos

---

## Listado Completo

### Parámetros de Negocio

| Clave | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| `horaCambioAfter` | string | "04:00" | Hora de inicio afterhour |
| `maxChicasBottella` | int | 2 | Máximo chicas por botella |
| `minValor150k` | int | 150000 | Umbral para comisión 150k+ |

---

### Comisiones

| Clave | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| `comisionNormalFija` | int | 5000 | Comisión estándar por defecto |
| `comisionPremiumFija` | int | 8000 | Comisión premium |
| `comisionAcompananteBotella` | int | 5000 | Comisión por acompanhante en botella |

---

### Porcentajes de Comisión por Volumen

| Clave | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| `porcBottella100k` | float | 0.4 | % comisión para botellas < minValor150k |
| `porcBottella150kMas` | float | 0.3 | % comisión para botellas ≥ minValor150k |

---

## Configuración de Afterhour

### horaCambioAfter

Define la hora a partir de la cual se considera afterhour.

```
horaCambioAfter: "04:00"
```

**Comportamiento:**
- Tragos después de las 04:00 no generan comisión
- Categorías con `isAfterhour: true` nunca generan comisión

**Formato:** HH:mm (24 horas)

---

## Configuración de Botellas

### maxChicasBottella

Cantidad máxima de chicas acompanhantes permitidas por botella.

```
maxChicasBottella: 2
```

**Validaciones:**
- Al crear comanda tipo botella
- Se calcula: chica1 + chica2 + adicionais ≤ maxChicasBottella

### porcBottella100k

Porcentaje de comisión para botellas de precio menor a `minValor150k`.

```
minValor150k: 150000
porcBottella100k: 0.4
```

| Precio | Comisión |
|--------|----------|
| $100,000 | $100,000 × 0.4 = $40,000 |
| $120,000 | $120,000 × 0.4 = $48,000 |
| $150,000 | $150,000 × 0.3 = $45,000 |

---

## Configuración de Comisiones

### comisionNormalFija

Monto fijo de comisión cuando no hay configuración por categoría.

```
comisionNormalFija: 5000
```

### comisionPremiumFija

Monto fijo de comisión para categorías premium.

```
comisionPremiumFija: 8000
```

### comisionAcompananteBotella

Monto adicional por cada acompanhante en botella.

```
comisionAcompananteBotella: 5000
```

**Cálculo para botella con 2 chicas:**
- Comisión base: `categoria.comision`
- Acompañante: `comisionAcompananteBotella × 1`
- Total: `categoria.comision + comisionAcompananteBotella`

---

## Modificar Parámetros

### Via API

```bash
curl -X PUT http://localhost:3000/api/config \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<jwt>" \
  -d '{
    "horaCambioAfter": "05:00",
    "maxChicasBottella": 3
  }'
```

### Via Prisma Studio

```bash
npx prisma studio
```

Navega a: **ConfigGeneral** → Editar registro

### Via Script

```typescript
import { prisma } from '@/lib/prisma'

await prisma.configGeneral.upsert({
  where: { clave: 'horaCambioAfter' },
  update: { valor: '05:00' },
  create: { clave: 'horaCambioAfter', valor: '05:00' }
})
```

---

## Valores por Defecto

El sistema asigna estos valores si no existen en la base de datos:

```typescript
const defaultConfig = {
  horaCambioAfter: '04:00',
  maxChicasBottella: 2,
  porcBottella100k: 0.4,
  porcBottella150kMas: 0.3,
  minValor150k: 150000,
  comisionPremiumFija: 10000,
  comisionNormalFija: 5000,
  comisionAcompananteBotella: 5000,
}
```

---

## Reset a Valores de Fábrica

```typescript
import { prisma } from '@/lib/prisma'

const defaults = {
  horaCambioAfter: '04:00',
  maxChicasBottella: 2,
  porcBottella100k: 0.4,
  porcBottella150kMas: 0.3,
  minValor150k: 150000,
  comisionPremiumFija: 10000,
  comisionNormalFija: 5000,
  comisionAcompananteBotella: 5000,
}

for (const [clave, valor] of Object.entries(defaults)) {
  await prisma.configGeneral.upsert({
    where: { clave },
    update: { valor },
    create: { clave, valor, descripcion: `Default: ${clave}` }
  })
}
```

---

## Categorías vs. Configuración Global

La configuración de categorías tiene prioridad sobre los valores globales:

| Fuente | Prioridad | Uso |
|--------|----------|-----|
| Categoria.comision | 1 (más alta) | Comisión específica del producto |
| Categoria.comisionChica | 1 | Comisión específica para tragos |
| ConfigGeneral | 2 | Valores por defecto |

---

*Última actualización: Abril 2026*