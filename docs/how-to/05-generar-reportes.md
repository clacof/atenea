# Cómo Generar Reportes

Reportes diarios, filtrados, exportaciones y análisis.

**Audiencia:** Administradores, supervisores
**Duración:** 10 minutos

---

## 1. Tipos de Reportes

### 1.1 Reportes disponibles

| Reporte | Descripción |
|---------|-------------|
| Diario | Ventas y comisiones del día |
| Por rango | Fechas personalizadas |
| Por categoría | Ventas por tipo de producto |
| Por chica | Comisiones generadas |
| Por medio de pago | Desglose de pagos |
| De caja | Movimiento de dinero |

---

## 2. Reporte Diario

### 2.1 Acceder

1. Ve a **Reportes**
2. Por defecto muestra el día actual

### 2.2 Contenido

```
REPORTE DIARIO
════════════════════════════════
Fecha: 24/04/2026
══════════════════════════��═════
COMANDAS
  Total: 45
  Pagadas: 42
  Anuladas: 3
─────────────────────────────────
VENTAS
  Tragos:       $890,000
  Botellas:    $1,250,000
  ─────────────────────────────
  TOTAL:      $2,140,000
─────────────────────────────────
COMISIONES
  Chicas:       $234,000
─────────────────────────────────
PAGOS
  Efectivo:      $980,000
  Transferencia: $780,000
  Débito:       $280,000
  Crédito:      $100,000
════════════════════════════════
```

---

## 3. Reporte por Rango de Fechas

### 3.1 Seleccionar rango

1. En **Reportes**, haz clic en **Rango**
2. Selecciona fecha inicio y fin
3. Haz clic en **Generar**

### 3.2 Períodos comunes

| Período | Uso |
|---------|-----|
| Hoy | Resumen rápido |
| Semana | Análisis semanal |
| Quincena | Cierre quincenal |
| Mes | Cierre mensual |

---

## 4. Reporte por Categoría

### 4.1 Ver desglose

1. Ve a **Reportes** → **Por Categoría**
2. Selecciona fechas
3. Verás:

| Categoría | Cantidad | Ventas | % |
|----------|----------|--------|-------|
| Cerveza | 85 | $680,000 | 32% |
| Vodka | 42 | $420,000 | 20% |
| Whisky | 15 | $525,000 | 25% |
| Blue Label | 3 | $450,000 | 21% |
| Otros | 8 | $65,000 | 3% |

### 4.2 Análisis

- Identifica productos más vendidos
- Calcula participación por categoría
- Detecta productos sin movimiento

---

## 5. Reporte por Chica

### 5.1 Comisiones generadas

1. Ve a **Reportes** → **Por Chica**
2. Selecciona fechas
3. Verás:

| Chica | Comisiones | Comandas | Promedio |
|-------|-----------|---------|---------|
| María G. | $52,000 | 14 | $3,714 |
| Laura P. | $45,000 | 12 | $3,750 |
| Sofía R. | $68,000 | 18 | $3,778 |
| Ana L. | $38,000 | 10 | $3,800 |

### 5.2 Detalle

Haz clic en una chica para ver:

- Lista de comandas
- Día y hora
- Categoría consumida
- Comisión generada

---

## 6. Reporte de Caja

### 6.1 Movimiento de caja

1. Ve a **Reportes** → **Caja**
2. Selecciona fechas
3. Verás:

| Concepto | Monto |
|---------|-------|
| Apertura | +$50,000 |
| Ingresos | +$892,000 |
| Comisiones | -$156,000 |
| Egresos | -$20,000 |
| **Cierre** | **$766,000** |

### 6.2 Conciliación

Compara:

- Sistema vs. arqueo físico
- Registros vs. transferencias bancarias
- Comisiones pagadas vs. registradas

---

## 7. Exportación

### 7.1 Formatos disponibles

| Formato | Uso |
|---------|-----|
| CSV | Hoja de cálculo, análisis |
| PDF | Impresión, archivado |
| Excel | Análisis detallado |

### 7.2 Exportar

1. Genera el reporte
2. Haz clic en **Exportar**
3. Selecciona formato
4. Descarga el archivo

### 7.3 Ejemplo CSV

```csv
Fecha,Categoria,Cliente,Tipo,Precio,Comision
24/04/2026,Cerveza,C1,Cliente,8000,0
24/04/2026,Vodka,C2,Cliente,12000,0
24/04/2026,Blue Label,C3,Cliente,150000,30000
```

---

## 8. Filtrado Avanzado

### 8.1 Filtros disponibles

| Filtro | Descripción |
|--------|-------------|
| Fecha | Rango de fechas |
| Usuario | Operador que creó |
| Categoría | Tipo de producto |
| Estado | activa, pagada, anulada |
| Medio de pago | Efectivo, transferencia... |
| Turno | Mañana, tarde, noche |

### 8.2 Guardar filtros

1. Configura los filtros deseados
2. Haz clic en **Guardar Filtro**
3. Asigna un nombre
4. Usa el filtro guardado desde el menú

---

## 9. Programación de Reportes

### 9.1 Reportes automáticos

En **Config**, configura envío automático:

| Parámetro | Descripción |
|---------|-----------|
| emailReportes | Destinatario |
| frecuenciaReportes | Diaria, semanal |
| horaEnvio | Hora de envío |

### 9.2 Activar

1. Ve a **Config** → **Reportes**
2. Configura los parámetros
3. Activa el envío automático
4. Confirma

---

## Checklist de Reportes

- [ ] Generar reporte diario
- [ ] Revisar ventas por categoría
- [ ] Verificar comisiones por chica
- [ ] Exportar para cierre mensual
- [ ] Conciliar con caja física

---

*Última actualización: Abril 2026*