# 📚 Guía Rápida de Uso - ATENEA PWA

## 🎯 Inicio Rápido

### 1. Instalar la App
```
1. Abre navegador → http://localhost:3000
2. Espera 2-3 segundos para ver el banner
3. Toca / Haz clic en "Instalar ATENEA"
4. ¡Listo! Aparecerá en tu pantalla de inicio
```

### 2. Anear en Móvil (Primero)
```
Email: admin@atenea.com
Contraseña: admin123
```

### 3. Primeros Pasos
- 📊 Dashboard: Resumen de ventas y KPIs
- 📋 Una Comanda: Crear venta
- 💰 Caja: Control diario
- 📈 Reportes: Análisis
- ⚙️ Config: Parámetros del sistema

---

## 📱 Características Rápidas

### ⚡ Atajos (Android/iOS)
Presiona largo el icono ATENEA:
- **Nueva Comanda** → Crear venta rápido
- **Caja** → Control de dinero

### 💾 Offline
- ✅ Funciona sin internet
- ✅ Datos se cachean automáticamente
- 🔄 Se sincroniza al conectar

### 🔐 Seguridad
- 🔐 Sesión 8 horas
- 🔓 Cierra automáticamente
- 📝 Todas las acciones se registran

---

## 📋 Crear Comanda (Lo más usual)

### Paso a Paso

**1. Dashboard → Nueva Comanda** (o usa el atajo ⚡)

**2. Selecciona Categoría**
   - Trago / Botella / Otro
   - Se calcula precio automáticamente

**3. Tipo de Consumo**
   - 👤 **Cliente**: Sin comisión
   - 💃 **Chica**: Con comisión (30-40%)

**4. Si es Chica**
   - Selecciona chica(s)
   - Otra chica (opcional)

**5. Configurar Descuentos (Opcional)**
   - % Descuento: 10%, 20%, etc.
   - O monto fijo: $5,000, $10,000
   - **Cortesía**: Descuento 100%

**6. Forma de Pago**
   - 💵 Efectivo
   - 🏦 Transferencia
   - 💳 Débito
   - 💳 Crédito

**7. Crear**
   - Se guarda automáticamente
   - Aparece en lista

✅ **¡Comanda creada!**

---

## 💰 Control de Caja

### Resumen Diario
```
Abre: Caja → Podrás ver:
├─ Total Efectivo
├─ Total Transferencia  
├─ Total Débito
├─ Total Crédito
└─ Total General
```

### Gráficos
- Distribución por meio de pago
- Tendencias del día

### Cierre de Turno
```
1. Caja → Cierre de Turno
2. Confirma totales
3. Guarda
4. Se bloquea hasta nuevo turno
```

---

## 📊 Reportes

### Qué ves
- 📈 Ventas totales
- 💰 Comisiones pagadas
- 👥 Desglose por chica
- 🏪 Desglose por categoría
- 💳 Desglose por medio de pago

### Exportar
- 📄 PDF (próximamente)
- 📊 Excel (próximamente)

---

## ⚙️ Configuración

### Parámetros del Sistema
```
Editar valores como:
- Comisión chicas
- Precios por categoría
- Límites de operación
```

### Usuarios
- Crear/editar cuentas
- Cambiar roles
- Desactivar usuarios

---

## 🔐 Seguridad & Tips

### Cambiar Contraseña
```
Config → Mi Cuenta → Cambiar Contraseña
```

### Cerrar Sesión
```
Perfil (arriba derecha) → Cerrar Sesión
O espera 8 horas y se cierra automáticamente
```

### Roles
- **Admin**: Todo
- **Caja**: Solo control de caja
- **Supervisor**: Ver repor, sin crear

---

## 🆘 Problemas Comunes

| Problema | Solución |
|----------|----------|
| No carga la app | Reinicia navegador, limpia cache |
| Botón "Instalar" no aparece | Espera 2-3 seg, recarga página |
| Offline no funciona | Service Worker no registrado, reinicia server |
| Comanda no guarda | Verifica conexión, revisa validaciones |
| Sesión expirada | Vuelve a logear, se cierra después 8h |

---

## 📞 Soporte Rápido

### Abrir DevTools (para soporte técnico)
```
PC: F12 o Ctrl+Shift+I
Mac: Cmd+Option+I
Mobile: Inspecciona en PC mediante USB
```

### Ver Logs
```
DevTools → Console → Busca mensajes rojo/amarillo
```

### Forzar Actualización
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

---

## 💡 Atajos de Teclado (PC)

| Atajo | Acción |
|-------|--------|
| `Ctrl+Shift+K` | Nueva Comanda |
| `Ctrl+K` | Buscar |
| `Esc` | Cerrar Modal |
| `Tab` | Navegar campos |

---

## 📈 Tips de Productividad

### 1. Comandas Rápidas
- Crea los modelos de tragos más comunes
- Usa los atajos del menú

### 2. Caja
- Cierra turno al terminar el día
- Revisa descrepancias diarias

### 3. Reportes
- Revisa a final de week
- Analiza tendencias

### 4. Offline
- La app funciona sin internet
- Los datos se sincronizan automáticamente

---

## 📱 Información del Dispositivo

Cómo verificar que PWA está instalada correctamente:

```
Android (Chrome):
  Menu → Aplicaciones → ATENEA
  Debe aparecer en lista

iOS (Safari):
  Pantalla de Inicio → ATENEA icon
  Debe tener icono personalizado

Windows/Mac:
  Debe haber acceso directo en Desktop/Dock
```

---

**Versión**: 1.0  
**Última actualización**: 18 de marzo de 2026  
**Preguntas**: Abre un issue en el repositorio
