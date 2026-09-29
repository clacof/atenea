# Cómo Gestionar Comandas

Receta para crear, editar, cerrar y anular comandas.

**Audiencia:** Operadores, cajeros, supervisores
**Duración:** 10 minutos

---

## 1. Conceptos Previos

Una **comanda** es un registro de consumo que puede ser:

| Tipo | Descripción |
|------|-------------|
| Cliente | Consumo pagado por el cliente |
| Chica | Consumo propio de la chica (no genera comisión) |

### Estados de comanda

| Estado | Significado |
|--------|------------|
| `activa` | Abierta, pendiente de pago |
| `pagada` | Cerrada y cobrada |
| `anulada` | Cancelada sin efecto |

---

## 2. Crear Comanda

### 2.1 Pasos

1. Ve a **Comandas** → **Nueva**
2. Completa el formulario

### 2.2 Campos obligatorios

| Campo | Descripción |
|-------|-------------|
| Categoría | Producto seleccionado |
| Tipo de consumo | Cliente o Chica |
| Precio base | Monto sin descuentos ni recargos |

### 2.3 Campos opcionales

| Campo | Descripción |
|-------|-------------|
| Chica 1 | Primera chica asignada |
| Chica 2 | Segunda chica (botellas) |
| Descuento % | Porcentaje de descuento |
| Descuento $ | Monto fijo de descuento |
| Cortesía | Consumo gratuito (sin comisión) |
| Medio de pago | Efectivo, transferencia, débito, crédito |

### 2.4 Ejemplo completo

```
Categoría: Whisky 12 años
Tipo de consumo: Cliente
Precio base: $25,000
Chica 1: María G.
Chica 2: (ninguna)
Descuento: 10%
Medio de pago: Efectivo
```

---

## 3. Editar Comanda

### 3.1 Cuándo editar

- Agregar/quitar chica asignada
- Aplicar descuento
- Corregir precio

### 3.2 Pasos

1. Ve a **Comandas**
2. Busca la comanda por fecha o cliente
3. Haz clic en **Editar**
4. Modifica los campos necesarios
5. Guarda los cambios

> **Restricciones:**
> - No se puede editar una comanda `pagada`
> - No se puede editar una comanda `anulada`

---

## 4. Agregar Chica a Comanda

### 4.1 Asignación simple

1. Edita la comanda
2. Selecciona la chica en **Chica 1**
3. Guarda

### 4.2 Asignación múltiple (botellas)

Para botellas con más de una chica:

1. Edita la comanda tipo **botella**
2. Asigna **Chica 1** y **Chica 2**
3. La comisión se divide automáticamente

### 4.3 Liberar chica

Si necesitas liberar una chica asignada por error:

1. Edita la comanda
2. Deselecciona la chica
3. Marca **Chica liberada** si ya fue atendida

---

## 5. Aplicar Descuentos

### 5.1 Descuento por porcentaje

```
Precio base: $100,000
Descuento: 10%
Precio final: $90,000
```

### 5.2 Descuento por monto

```
Precio base: $100,000
Descuento: $15,000
Precio final: $85,000
```

### 5.3 Cortesía

Marca **Cortesía** cuando el consumo es gratuito:

- Precio final: $0
- Comisión: $0
- Sin recargos

---

## 6. Pagos con Tarjeta

### 6.1 Recargo por crédito

Al pagar con tarjeta de crédito, se aplica un recargo configurable por categoría:

| Categoría | Recargo crédito |
|-----------|---------------|
| Tragos | $500 por consumo |
| Botellas | $2,000 por botella |

### 6.2 Botellas solo transferencia

Algunas botellas (ej: Blue Label) solo aceptan transferencia:

- El campo `soloTransferencia` bloquea otros medios
- Muestra mensaje al operador

---

## 7. Cerrar Comanda

### 7.1 Pasos

1. Selecciona la comanda
2. Haz clic en **Cerrar**
3. Confirma el medio de pago
4. La comanda cambia a `pagada`

### 7.2 Cierre desde Turno

También puedes cerrar desde **Turno**:

1. Selecciona el cliente
2. Revisa sus comandas
3. Haz clic en **Cerrar Cuenta**
4. Todas las comandas se marcan como `pagada`

---

## 8. Anular Comanda

### 8.1 Cuándo anular

- Error de registro
- Cliente se va sin consumir
- Cancelación por cualquier motivo

### 8.2 Pasos

1. Ve a la comanda
2. Haz clic en **Anular**
3. Confirma la anulación
4. La comanda cambia a `anulada`

### 8.3 Efectos de anulación

- La chica queda **liberada** para nuevas asignaciones
- La comanda no aparece en reportes de ventas
- Se registra en **AuditLog** para trazabilidad

---

## 9. Listado de Comandas

### 9.1 Filtros disponibles

| Filtro | Descripción |
|--------|-------------|
| Fecha | Rango de fechas |
| Estado | activa, pagada, anulada |
| Categoría | Por tipo de producto |
| Usuario | Operador que creó la comanda |

### 9.2 Ejemplo: Comandas del día

1. Ve a **Comandas**
2. Filtra por fecha: hoy
3. Filtra por estado: pagada
4. Verás todas las comandas cerradas del día

---

## Referencia Rápida

| Acción | Método |
|--------|--------|
| Crear | Formulario en Nueva Comanda |
| Editar | Click en editar desde listado |
| Cerrar | Botón "Cerrar" o desde Turno |
| Anular | Botón "Anular" con confirmación |

---

*Última actualización: Abril 2026*