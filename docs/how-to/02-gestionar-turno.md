# Cómo Gestionar Turno Activo

Control de clientes abiertos, cuentas parciales y cierre de turno.

**Audiencia:** Operadores, cajeros
**Duración:** 15 minutos

---

## 1. Conceptos Previos

### 1.1 Qué es un turno

Un **turno** es la jornada de trabajo donde se registran comandas. Cada turno tiene:

- Lista de **clientes abiertos** (pendientes de cerrar)
- Resumen de **transacciones** por medio de pago
- Total de **comisiones** a chicas

### 1.2 Cliente correlativo

Cada cliente nuevo recibe un correlativo diario:

```
C1, C2, C3... Cn
```

El correlativo se reinicia cada día.

---

## 2. Cliente Nuevo

### 2.1 Pasos para abrir

1. Ve a **Turno**
2. Haz clic en **Nuevo Cliente**
3. El sistema asigna automáticamente el correlativo

### 2.2 Ejemplo

```
NUEVO CLIENTE
══════════════════��═══════════
Cliente: C1
Hora: 22:30
Estado: ABIERTO
Comandas: 0
Total: $0
══════════════════════════════
```

---

## 3. Cliente Existente

### 3.1 Ver clientes abiertos

1. Ve a **Turno**
2. Verás la lista de clientes con:
   - Correlativo (C1, C2...)
   - Número de comandas
   - Total acumulado
   - Hora de última comanda

### 3.2 Seleccionar cliente

1. Haz clic en el cliente
2. Se expande mostrando sus comandas
3. Puedo agregar más comandas

### 3.3 Vista de detalle

```
CLIENTE C1
══════════════════════════════
Comandas:
  [1] Cerveza x2      $16,000
  [2] Vodka          $12,000
  [3] Blue Label      $150,000
─────────────────────────────────
Subtotal:            $178,000
Descuentos:          -$10,000
TOTAL:              $168,000
─────────────────────────────────
Medio: Efectivo
[Agregar Comanda] [Cerrar Cuenta]
══════════════════════════════
```

---

## 4. Agregar Comanda a Cliente

### 4.1 Pasos

1. Selecciona el cliente en Turno
2. Haz clic en **Agregar Comanda**
3. Se abre el formulario de comanda
4. Al guardar, la comanda se asocia al cliente

### 4.2 Asignar chica automáticamente

Si asignas una chica en el formulario:

- La chica queda **bloqueada** para otros clientes
- Se registra en la comanda
- La comisión se calcula automáticamente

---

## 5. Ver Cuentas Abiertas

### 5.1 Panel de resumen

En **Turno** ves un resumen:

```
TURNO ACTIVO
══════════════════════════════════════
Clientes abiertos: 5
Total abierto: $892,000
─────────────────────────────────
CHICAS DISPONIBLES
  🟢 María G.    Libre
  🟢 Laura P.    Libre
  🔴 Sofía R.    Ocupada (C2)
  🟢 Ana L.      Libre
══════════════════════════════════════
```

### 5.2 Indicadores de disponibilidad

| Indicador | Significado |
|----------|-----------|
| 🟢 Verde | Disponible |
| 🔴 Rojo | Ocupada en otra comanda |

---

## 6. Cerrar Cuenta de Cliente

### 6.1 Pasos

1. Selecciona el cliente
2. Revisa las comandas abiertas
3. Haz clic en **Cerrar Cuenta**
4. Selecciona el medio de pago:
   - Efectivo
   - Transferencia
   - Débito
   - Crédito

### 6.2 Comprobante

Al cerrar, el sistema puede:

- Imprimir ticket
- Generar comprobante digital
- Registrar en caja

### 6.3 Efectos del cierre

- Todas las comandas pasan a `pagada`
- Las chicas quedan **liberadas**
- El cliente desaparece de la lista abierta

---

## 7. Cierre de Turno

### 7.1 Cuándo cerrar

- Fin de jornada laboral
- Cambio de operador
- Cierre de caja diario

### 7.2 Pasos

1. Ve a **Caja**
2. Revisa el resumen:
   ```
   CIERRE DE TURNO
   ═════════════════════════
   Fecha: 24/04/2026
   Turno: Noche
   ═════════════════════════
   Efectivo:      $450,000
   Transferencia:  $280,000
   Débito:        $120,000
   Crédito:       $42,000
   ───────────────────────────
   TOTAL:         $892,000
   ═════════════════════════
   ```
3. Haz clic en **Cerrar Turno**
4. Confirma el monto total

### 7.3 After cierre

- No se pueden crear nuevas comandas
- El turno queda bloqueado
- Se genera reporte para auditoría

---

## 8. Liberar Cliente Manual

### 8.1 Cuándo liberar manualmente

- Cliente se fue sin cerrar
- Error de apertura
- Cliente no consumió

### 8.2 Pasos

1. Selecciona el cliente
2. Haz clic en **Liberar Cliente**
3. Confirma la liberación
4. Las comandas se marcan como `anulada`

---

## 9. Reporte de Turno

### 9.1 Contenido del reporte

| Sección | Descripción |
|---------|-------------|
| Resumen general | Total ventas, comandas, clientes |
| Por categoría | Ventas por tipo de producto |
| Por chica | Comisiones generadas |
| Por medio de pago | Desglose de pagos |
| Comisiones | Total comisiones del turno |

### 9.2 Acceso al reporte

1. Ve a **Reportes**
2. Selecciona rango de fechas
3. Filtra por turno (opcional)
4. Exporta en CSV o PDF

---

## Checklist de Turno

- [ ] Clientes abiertos al inicio de turno
- [ ] Comandas creadas correctamente
- [ ] Chicas asignadas sin conflictos
- [ ] Cuentas cerradas al final
- [ ] Cierre de turno completado
- [ ] Reporte generado

---

*Última actualización: Abril 2026*