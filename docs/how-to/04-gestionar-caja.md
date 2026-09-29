# Cómo Gestionar Caja

Apertura, movimientos, cierres y reportes de caja.

**Audiencia:** Cajeros, supervisores, administradores
**Duración:** 15 minutos

---

## 1. Conceptos Previos

### 1.1 Caja de turno

La **caja** registra todos los movimientos de dinero durante un turno:

- Ingresos por ventas
- Desglose por medio de pago
- Total general

### 1.2 Medios de pago

| Medio | Descripción |
|-------|-------------|
| Efectivo | Dinero físico |
| Transferencia | Pago electrónico |
| Débito | Tarjeta de débito |
| Crédito | Tarjeta de crédito (+ recargo) |

---

## 2. Apertura de Caja

### 2.1 Primer paso del día

1. Ve a **Caja**
2. Haz clic en **Abrir Caja**
3. Ingresa el monto de apertura (fondo de cambio)
4. Confirma

### 2.2 Fondo de cambio

El fondo de cambio es el efectivo inicial para dar vueltos:

```
APERTURA DE CAJA
════════════════════════════════
Fecha: 24/04/2026
Hora: 21:00
Fondo de cambio: $50,000
────────────────────────────
Cajero: Juan Pérez
════════════════════════════════
```

---

## 3. Recibir Pagos

### 3.1 Por medio de pago

Al cerrar una cuenta, seleccionas el medio:

| Medio | Registro automático |
|-------|-------------------|
| Efectivo | → CajaEfectivo |
| Transferencia | → CajaTransferencia |
| Débito | → CajaDébito |
| Crédito | → CajaCrédito |

### 3.2 Vista en tiempo real

En **Caja** ves el acumulado:

```
CAJA ACTUAL
════════════════════════════════
Efectivo:      $450,000
Transferencia:  $280,000
Débito:        $120,000
Crédito:        $42,000
────────────────────────────
TOTAL:         $892,000
════════════════════════════════
```

---

## 4. Cierre de Turno

### 4.1 Pasos para cerrar

1. Ve a **Caja**
2. Verifica que no haya clientes abiertos
3. Revisa el resumen completo
4. Haz clic en **Cerrar Turno**
5. Confirma el monto total

### 4.2 Cierre parcial

Si necesitas hacer cierre parcial (cambio de cajero):

1. Ve a **Caja**
2. Haz clic en **Cierre Parcial**
3. Ingresa el monto a entregar
4. Imprime el comprobante
5. El siguiente cajero abre con nuevo fondo

### 4.3 Validación

El sistema valida:

- Clientes abiertos deben estar cerrados
- Comisiones pendientes deben estar calculadas
- No hay comandas sin medio de pago

---

## 5. Reporte de Caja

### 5.1 Contenido del reporte

```
REPORTE DE CAJA
════════════════════════════════
Fecha: 24/04/2026
Turno: Noche (21:00 - 05:00)
════════════════════════════════
INGRESOS
  Efectivo:        $450,000
  Transferencia:   $280,000
  Débito:         $120,000
  Crédito:         $42,000
  ─────────────────────────────
  TOTAL:          $892,000
════════════════════════════════
EGRESOS
  Comisiones:     -$156,000
  ─────────────────────────────
  NETO:          $736,000
════════════════════════════════
```

### 5.2 Exportar reporte

1. Ve a **Reportes** → **Caja**
2. Selecciona fechas
3. Haz clic en **Exportar**
4. Formato: CSV o PDF

---

## 6. Arqueo de Caja

### 6.1 Cuándo hacer arqueo

- Cierre de turno
- Investigación de faltantes
- Auditoría

### 6.2 Proceso

1. Ve a **Caja** → **Arqueo**
2. Cuenta el dinero físico
3. Ingresa el monto contado
4. Compara con el registrado

### 6.3 Discrepancias

| Situación | Acción |
|-----------|--------|
| Faltante | Registrar y reportar |
| Sobrante | Registrar y investigar |
| Cuadrado | Confirmar cierre |

---

## 7. Corte por Medio de Pago

### 7.1 Ver corte

1. Ve a **Caja** → **Corte por Medio**
2. Selecciona el medio
3. Verás el detalle:

```
CORTE POR TRANSFERENCIA
════════════════════════════════
Fecha: 24/04/2026
────────────────────────────
Cantidad operaciones: 15
Monto total: $280,000
────────────────────────────
Detalle:
  C1: $25,000
  C3: $45,000
  C5: $120,000
  ...
════════════════════════════════
```

---

## 8. Configuración de Caja

### 8.1 Recargos por crédito

En **Categorías**, configura el recargo:

| Categoría | Recargo Crédito |
|----------|-----------------|
| Tragos | $500 |
| Botellas | $2,000 |

### 8.2 Límites

En **Config**:

| Parámetro | Descripción |
|-----------|-------------|
| maxTransferencia | Límite por operación |
| minEfectivo | Mínimo para pago en efectivo |

---

## Checklist de Caja

- [ ] Abrir caja con fondo de cambio
- [ ] Registrar pagos por medio correcto
- [ ] Hacer cierre parcial si hay cambio de cajero
- [ ] Cerrar clientes abiertos antes de cerrar
- [ ] Generar reporte de cierre
- [ ] Realizar arqueo si es necesario

---

*Última actualización: Abril 2026*