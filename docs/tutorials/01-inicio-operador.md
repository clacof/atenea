# Inicio Rápido para Operador

Guía paso a paso para comenzar a operar ATENEA en tu primer día.

## Antes de Comenzar

Esta guía está diseñada para operadores nuevos que necesitan aprender a usar el sistema ATENEA para gestionar comandas en un nightclub. No requiere conocimientos técnicos previos.

**Tiempo estimado:** 15 minutos
**Resultado esperado:** Ser capaz de crear una comanda, atender un cliente y cerrar una cuenta

---

## 1. Acceder al Sistema

### 1.1 Abrir sesión

1. Abre tu navegador y visita la dirección que te proporcionó el administrador
2. Ingresa tu usuario y contraseña
3. Haz clic en **Ingresar**

> **Credenciales de prueba:** `admin@atenea.com` / `admin123`
> Estas credenciales son solo para desarrollo. En producción, usa las credenciales que te asignaron.

### 1.2 Interfaz principal

Una vez dentro, verás el **Dashboard** con el menú lateral izquierdo:

```
┌─────────────────────────────────────────────────┐
│  ☰ ATENEA          [Usuario] ▼                  │
├─────────┬───────────────────────────────────────┤
│ Comandas│                                       │
│ Nueva  │     [Área de trabajo principal]        │
│ Turno  │                                       │
│ Chicas │                                       │
│ Caja   │                                       │
│ ────── │                                       │
│ Report │                                       │
│ Config │                                       │
└─────────┴───────────────────────────────────────┘
```

---

## 2. Crear tu Primera Comanda

### 2.1 Nueva comanda

1. Haz clic en **Comandas** en el menú
2. Selecciona **Nueva**
3. Aparecerá el formulario de comanda

### 2.2 Campos del formulario

| Campo | Descripción |
|-------|-------------|
| Categoría | Selecciona el tipo de consumo (trago o botella) |
| Tipo de consumo | **Cliente** o **Chica** |
| Chica 1 | Asigna la primera chica (opcional) |
| Chica 2 | Asigna segunda chica (opcional) |
| Precio base | Monto del consumo |

### 2.3 Flujo básico

```
Seleccionar categoría → Elegir tipo (cliente/chica) → Ingresar precio → [Guardar]
```

### 2.4 Ejemplo: Trago para cliente

1. Categoría: **Cerveza** (tipo trago)
2. Tipo de consumo: **Cliente**
3. Precio base: **$8,000**
4. Haz clic en **Guardar**

La comanda se crea y aparece en la lista del turno activo.

---

## 3. Atender un Cliente

### 3.1 Cliente nuevo vs. existente

**Cliente nuevo:**
1. Ve a **Turno** → **Nuevo Cliente**
2. El sistema asigna automáticamente un correlativo (C1, C2, C3...)
3. Crea la comanda asociada a este cliente

**Cliente existente:**
1. Ve a **Turno**
2. Busca al cliente en la lista de clientes abiertos
3. Selecciona el cliente
4. Agrega comandas a su cuenta

### 3.2 Asignar chica a comanda

1. Crea o edita una comanda
2. En el campo **Chica 1**, selecciona la chica disponible
3. La disponibilidad se muestra con colores:
   - 🟢 **Verde:** Disponible
   - 🔴 **Rojo:** Ocupada en otra comanda activa

---

## 4. Cerrar una Cuenta

### 4.1 steps

1. Ve a **Turno**
2. Selecciona el cliente
3. Revisa las comandas abiertas
4. Haz clic en **Cerrar Cuenta**
5. Selecciona el medio de pago:
   - Efectivo
   - Transferencia
   - Débito
   - Crédito

### 4.2 Impresión de ticket

Al cerrar, el sistema puede generar un ticket con el detalle de la cuenta. Sigue las instrucciones del administrador para configurar la impresora.

---

## 5. Cerrar Turno

### 5.1 Finalizar jornada

1. Ve a **Caja**
2. Revisa el resumen del turno
3. Haz clic en **Cerrar Turno**
4. Confirma el monto total

### 5.2 Reporte diario

El sistema genera automáticamente un reporte con:
- Total de ventas
- Ventas por categoría
- Comisiones pagadas a chicas
- Desglose por medio de pago

---

## Próximos Pasos

- [Cómo Gestionar Comandas](./how-to/gestionar-comandas.md) - Guía detallada de comandas
- [Cómo Gestionar Turno](./how-to/gestionar-turno.md) - Control de turno activo
- [Glosario](./reference/glossary.md) - Términos del negocio

---

## Problemas Comunes

| Problema | Solución |
|----------|----------|
| No puedo asignar chica | Verifica que esté disponible en turno activo |
| Formulario no guarda | Revisa campos obligatorios (* marca los requeridos) |
| Sesión expiró | Vuelve a iniciar sesión |

---

*Última actualización: Abril 2026*