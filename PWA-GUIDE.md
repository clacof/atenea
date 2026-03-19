# 📱 Guía PWA - ATENEA Night Club

## ¿Qué es PWA?

Una **Progressive Web App (PWA)** es una aplicación web que funciona como una app nativa en tu dispositivo:
- ✅ Se instala en PC, Mac, Linux, Android e iOS
- ✅ Funciona offline (sin internet)
- ✅ Acceso rápido desde pantalla de inicio
- ✅ Notificaciones push (próximamente)
- ✅ Sincronización automática de datos

---

## 🚀 Instalación por Dispositivo

### 📱 **Android**

#### Opción 1: Chrome Browser (Recomendado)
1. Abre el navegador Chrome
2. Ve a `http://localhost:3000` (o IP del servidor)
3. Espera 2-3 segundos
4. Se mostrará un banner **"Instalar ATENEA"**
5. Toca **"Instalar"**
6. La app aparecerá en tu pantalla de inicio

#### Opción 2: Samsung Internet / Firefox
1. Abre el navegador
2. Ve a `http://servidor-atenea:3000`
3. Toca el menú (⋯)
4. Selecciona **"Instalar aplicación"** o **"Agregar a pantalla de inicio"**
5. Confirma

#### Opción 3: Acceso desde PC remoto
```bash
# En el PC servidor (macOS)
./share-tunnel.sh
# Escanea el código QR con tu Android
```

---

### 💻 **Windows**

#### Chrome / Edge
1. Abre Chrome o Edge
2. Ve a `http://localhost:3000`
3. Haz clic en el icono **"+"** en la barra de direcciones
4. Selecciona **"Instalar ATENEA"**
5. La app se abrirá como aplicación independiente
6. Aparecerá en tu menú Inicio y desktop

#### Comando de acceso directo
```powershell
# Crear acceso directo personalizado
New-Item -ItemType Link -Path "$env:USERPROFILE\Desktop\ATENEA.lnk" -Target "http://localhost:3000"
```

---

### 🍎 **macOS / Mac**

#### Safari (Recomendado)
1. Abre Safari
2. Ve a `http://localhost:3000`
3. Haz clic en **Compartir** (el icono de rectángulo con flecha)
4. Selecciona **"Agregar a El Muelle"** o **"Agregar a Escritorio"**
5. Elige la ubicación

#### Chrome
1. Abre Chrome
2. Ve a `http://localhost:3000`
3. Click en el icono **"+"** en la barra de direcciones
4. Selecciona **"Instalar ATENEA"**
5. La app estará en `/Applications/ATENEA.app`

#### Lanzar desde Terminal
```bash
# Abrir como app
open -a Chrome "http://localhost:3000"

# Con web app mode
open -a "Google Chrome" --args --app="http://localhost:3000"
```

---

### 🐧 **Linux**

#### Chrome / Chromium
1. Abre Chrome o Chromium
2. Ve a `http://localhost:3000`
3. Presiona `Ctrl + Shift + B` o usa el menú (⋮)
4. **"Instalar ATENEA"**
5. Aparecerá en el men Aplicaciones y desktop

#### Línea de comandos
```bash
# Crear launcher para GNOME/KDE
google-chrome --app="http://localhost:3000"
```

---

### 🍎 **iOS (iPhone/iPad)**

#### Safari
1. Abre Safari
2. Ve a `http://servidor-atenea:3000` (debe ser URL)
3. Toca el icono **Compartir** (flecha hacia arriba)
4. Presiona **"Agregar a pantalla de inicio"**
5. Dale un nombre (ej: "ATENEA")
6. Toca **"Agregar"**
7. Aparecerá como app en tu pantalla de inicio

**Nota**: iOS necesita que el sitio esté en HTTPS o en red local para funcionar offline.

---

## 🔌 Conectar Dispositivos Remotos

### Desde PC macOS

#### Opción 1: Tunnel con compartir pantalla
```bash
# En el servidor
./share-tunnel.sh

# Te dará una URL tipo:
# https://atenea-12345.ngrok.io
# Escanea con tu móvil
```

#### Opción 2: Red local (LAN)
```bash
# Obtén la IP local de tu PC
ifconfig | grep "inet " | grep -v 127.0.0.1

# En móvil, accede a:
# http://192.168.x.x:3000
```

#### Opción 3: Mismo PC (para probar)
```bash
# Terminal 1: Inicia servidor
npm run dev

# Terminal 2: Abre navegador
open http://localhost:3000
```

---

## 📲 Uso de la PWA

### Crear Nueva Comanda (Atajo Rápido)

En la pantalla de inicio del móvil, presiona largo en el icono → verás opciones:
- ⚡ **Nueva Comanda** (acceso directo)
- 💰 **Control de Caja** (acceso directo)

### Modo Offline

Cuando **no hay internet**:
- ✅ Puedes ver datos cacheados
- ✅ Puedes ver últimas comandas
- 🔄 No puedes crear nuevas (se guardan en cola)
- 📡 Se sincronizarán automáticamente al reconectar

**Página offline**: Se mostrará automáticamente si no hay conexión a `/api/health`

### Sincronización en Segundo Plano

1. Crea una comanda sin internet
2. No se enviará inmediatamente (ícono de "⏳ Por enviar")
3. Cuando se reconecte, se sincroniza automáticamente
4. Notificación: "Comanda enviada ✅"

---

## ⚙️ Configuración Técnica

### Service Worker
- **Ubicación**: `/public/service-worker.js`
- **Estrategia**: Network-First para API, Cache-First para assets
- **Cache**: se actualiza automáticamente con versión `atenea-v1`

### Manifest PWA
- **Ubicación**: `/public/manifest.json`
- **Nombre corto**: ATENEA (11 caracteres)
- **Colores**: Tema oscuro (#1f2937)

### Meta Tags
```
theme-color: #1f2937
apple-mobile-web-app-capable: yes
mobile-web-app-capable: yes
status-bar-style: black-translucent
```

---

## 🛠️ Troubleshooting

### No aparece el botón "Instalar"

Requiere:
- ✅ HTTPS o localhost
- ✅ Valid manifest.json
- ✅ Service Worker registrado
- ✅ Mínimo 2 iconos en manifest

**Solución**:
```bash
# Reinicia el servidor
npm run dev

# Limpia cache del navegador
# Chrome DevTools > Application > Clear storage
```

### Offline no funciona

1. Abre **Chrome DevTools** (F12)
2. Ve a **Application** → **Service Workers**
3. Verifica que esté **"activated"**
4. Ve a **Cache** → verifica "atenea-v1"

Si falta el service worker:
```bash
npm run build
npm start
```

### Comanda no se sincroniza

1. Abre DevTools → **Network**
2. Verifica que haya conexión a `/api/comandas`
3. Revisa **Application** → **Storage** → **IndexedDB**

---

## 🚀 Deploy en Producción

### Requisitos
- ✅ HTTPS (puede ser auto-firmado para red local)
- ✅ Dominio válido o IP estática
- ✅ Service Worker visible en `/service-worker.js`

### Pasos

#### 1. Build
```bash
npm run build
npm start
```

#### 2. HTTPS (usando Caddy o nginx)
```bash
# Con Caddy (más simple)
caddy file-server --listen :443 --domain atenea.local
```

#### 3. Red local (sin HTTPS needed)
```bash
# Ejecutar en IP local
PM2 o systemd para mantener activo
```

#### 4. Verifica PWA
```
Chrome DevTools > Lighthouse > PWA
Debe pasar todos los checks ✅
```

---

## 📊 Monitoreo

### Ver qué está cacheado
```javascript
// En DevTools Console
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`${name}:`, requests.map(r => r.url));
      });
    });
  });
});
```

### Limpiar cache manualmente
```javascript
// En Console
caches.keys().then(names => {
  return Promise.all(names.map(name => caches.delete(name)));
});
```

---

## 📝 Checklist de Instalación

- [ ] Servidor iniciado con `npm run dev`
- [ ] Acceso a `http://localhost:3000`
- [ ] Banner de instalación visible (esperar 2-3s)
- [ ] App instalada en pantalla de inicio
- [ ] Icono aparece correctamente
- [ ] Funciona offline (desconecta internet)
- [ ] Se sincroniza al reconectar

---

## 💡 Próximas Mejoras

- [ ] Notificaciones push
- [ ] Sincronización automática cada 5 min
- [ ] Modo fullscreen mejorado
- [ ] Gestos nativos (pull to refresh)
- [ ] Atajos de teclado

---

**Versión**: 1.0  
**Última actualización**: 18 de marzo de 2026  
**Soporte**: Si tienes problemas, abre Chrome DevTools (F12) → Console y verifica logs
