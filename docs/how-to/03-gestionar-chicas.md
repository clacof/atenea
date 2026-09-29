# Cómo Gestionar Chicas

Administración de personal femenino, disponibilidad y asignaciones.

**Audiencia:** Administradores, supervisores
**Duración:** 10 minutos

---

## 1. Conceptos Previos

### 1.1 Chica disponible

Una chica se considera **disponible** cuando:

- Está activa en el sistema
- No está asignada a ninguna comanda activa del día

### 1.2 Estados

| Estado | Descripción |
|--------|-------------|
| Activa | Puede ser asignada |
| Inactiva | No aparece en asignaciones |

---

## 2. Registro de Chicas

### 2.1 Agregar chica nueva

1. Ve a **Chicas**
2. Haz clic en **Nueva**
3. Completa:
   - Nombre completo
   - Fecha de ingreso (automática)
   - Estado: Activa

### 2.2 Editar chica

1. Ve a **Chicas**
2. Busca la chica
3. Haz clic en **Editar**
4. Modifica los campos
5. Guarda

### 2.3 Desactivar chica

Cuando una chica deja de trabajar:

1. Edita su registro
2. Cambia estado a **Inactiva**
3. La chica ya no aparece para asignar

> **Nota:** Las comandas existentes no se ven afectadas.

---

## 3. Disponibilidad en Tiempo Real

### 3.1 Ver disponibilidad

En **Turno** y **Nueva Comanda**, ves un panel con chicas:

```
CHICAS DISPONIBLES
══════════════════════════════
🟢 María G.    Libre
🟢 Laura P.    Libre
🔴 Sofía R.    Ocupada (C2)
🟢 Ana L.      Libre
🔴 Carla M.    Ocupada (C1)
══════════════════════════════
```

### 3.2 Indicadores

| Indicador | Significado |
|-----------|------------|
| 🟢 Verde | Disponible para asignar |
| 🔴 Rojo | Asignada en comanda activa |

---

## 4. Asignar Chica a Comanda

### 4.1 Asignación simple

1. Crea o edita comanda
2. Selecciona chica en **Chica 1**
3. La disponibilidad se actualiza automáticamente

### 4.2 Múltiples chicas

Para botellas con acompañantes:

1. Crea comanda tipo **botella**
2. Selecciona **Chica 1**
3. Selecciona **Chica 2**
4. La comisión se divide entre ambas

### 4.3 Chica que recibe comisión

Para tragos, puedes especificar quién recibe la comisión:

1. Crea comanda tipo **trago**
2. Asigna chica(s)
3. Selecciona **Chica que recibe comisión**
4. La comisión va a esa chica específica

---

## 5. Liberar Chica

### 5.1 Liberación automática

La chica se libera automáticamente cuando:

- La comanda se cierra (paga)
- La comanda se anula

### 5.2 Liberación manual

Si necesitas liberar por error:

1. Edita la comanda
2. Deselecciona la chica
3. Marca **Chica liberada** si ya fue atendida

### 5.3 Forzar liberación

Solo administrators pueden liberar sin cerrar/anular:

1. Ve a **Config** → **Herramientas**
2. Selecciona la chica
3. Haz clic en **Forzar Liberación**
4. Confirma la acción

---

## 6. Comisiones por Chica

### 6.1 Ver comisiones

1. Ve a **Reportes** → **Por Chica**
2. Selecciona rango de fechas
3. Verás:

| Chica | Comisiones | Comandas |
|-------|------------|----------|
| María G. | $45,000 | 12 |
| Laura P. | $38,000 | 10 |
| Sofía R. | $52,000 | 14 |

### 6.2 Detalle de comisión

| Tipo | Cálculo |
|------|---------|
| Trago | Sin comisión para chica |
| Botella | Comisión ÷ número de chicas |
| Chica consume | Comisión completa |

---

## 7. Historial de Chicas

### 7.1 Ver historial

1. Ve a **Chicas**
2. Selecciona una chica
3. Haz clic en **Historial**

### 7.2 Información del historial

| Campo | Descripción |
|-------|-------------|
| Fecha | Día de la comanda |
| Comanda | ID de la comanda |
| Cliente | Correlativo del cliente |
| Categoría | Producto consumido |
| Comisión | Monto generado |

---

## 8. Configuración de Comisiones

### 8.1 Por categoría

En **Categorías**, configura:

| Campo | Descripción |
|-------|-------------|
| Comisión | Monto base de comisión |
| isAfterhour | Sin comisión si es afterhour |

### 8.2 Configuración global

En **Config**, parámetros generales:

| Parámetro | Descripción |
|-----------|-------------|
| comisionNormalFija | Comisión estándar |
| comisionPremiumFija | Comisión premium |
| comisionAcompananteBotella | Por acompañante en botella |

---

## Checklist de Gestión

- [ ] Registrar chica nueva
- [ ] Actualizar estado al contratar/despedir
- [ ] Verificar disponibilidad en tiempo real
- [ ] Asignar correctamente según tipo de comanda
- [ ] Revisar comisiones en reportes

---

*Última actualización: Abril 2026*