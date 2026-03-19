# ✅ Checklist PWA - Verificación de Instalación

## 1️⃣ Verificar Service Worker

### En Chrome DevTools
```
1. Abre la app → F12
2. Ve a: Application → Service Workers
3. Debe mostrar:
   ✅ One service worker found
   ✅ Status: activated and running
```

### En Console
```javascript
// Ejecuta en Console
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
  if (regs.length > 0) {
    console.log('✅ Service Worker está registrado');
  } else {
    console.log('❌ No hay Service Worker');
  }
});
```

---

## 2️⃣ Verificar Manifest

### En DevTools
```
1. F12 → Application → Manifest
2. Debe mostrar JSON válido from /manifest.json
3. Campos requeridos:
   ✅ name
   ✅ short_name
   ✅ start_url
   ✅ icons (mínimo 2)
   ✅ display: standalone
```

### En Console
```javascript
fetch('/manifest.json')
  .then(r => r.json())
  .then(data => {
    console.log('✅ Manifest válido:', data);
  })
  .catch(e => console.error('❌ Error:', e));
```

---

## 3️⃣ Verificar Cache

### En DevTools
```
1. F12 → Application → Cache Storage
2. Debe existir: "atenea-v1"
3. Click en atenea-v1 y debe mostrar:
   ✅ Entries con / , /login, /dashboard, etc.
```

### Limpiar Cache (si hay problemas)
```javascript
// En Console
caches.keys().then(names => {
  return Promise.all(names.map(name => caches.delete(name)));
}).then(() => {
  console.log('✅ Cache cleared, reload page');
  location.reload();
});
```

---

## 4️⃣ Verificar Instalabilidad

### Test en Chrome
```
F12 → Lighthouse (pestaña)
→ Run Lighthouse → PWA
```

Debe pasar todos estos checks:
- ✅ Manifest exists
- ✅ Icon size (192x192, 512x512)
- ✅ Service Worker
- ✅ HTTPS or localhost
- ✅ Start URL responds
- ✅ Viewport meta tag
- ✅ Theme color

---

## 5️⃣ Verificar Meta Tags

### En El Código Fuente
```
Ctrl+U o Cmd+U en navegador
Busca en el código:
```

```html
<!-- Deben estar presentes -->
<meta name="theme-color" content="#1f2937" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="manifest" href="/manifest.json" />
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

---

## 6️⃣ Comprobar en Móvil

### Android (Chrome)
```
1. Abre Chrome
2. Navega a http://192.168.x.x:3000
3. Espera 2-3 segundos
4. Debe aparecer popup: "Instalar ATENEA"
5. Si no aparece:
   - Limpia cache del navegador
   - Recarga la página
   - Cierra Chrome completamente
   - Reabre
```

### iOS (Safari)
```
1. Abre Safari
2. Navega a http://192.168.x.x:3000
3. Toca el icono Compartir (flecha hacia arriba)
4. Scroll abajo
5. Presiona "Agregar a pantalla de inicio"
6. Confirma nombre
```

---

## 7️⃣ Probar Offline

### Desactivar Internet
```
1. Instala la app
2. Desconecta WiFi/datos
3. Abre la app
4. Debe mostrar último contenido cacheado
5. Intenta crear comanda (se dirá "En preparación")
6. Conecta internet de nuevo
7. Debe sincronizarse automáticamente
```

### Simular Offline en DevTools
```
F12 → Network → Offline (checkbox)
Refresca página → debe mostrar contenido cacheado
```

---

## 8️⃣ HTTP Headers (Servidor)

### Verificar Headers de Caché
```bash
curl -I http://localhost:3000
```

Debe mostrar:
```
Cache-Control: public, headers-immutable, max-age=...
Content-Type: text/html; charset=UTF-8
```

---

## 9️⃣ Verificar Archivos Estáticos

### Archivos Requeridos
```
✅ /public/manifest.json
✅ /public/service-worker.js
✅ /public/offline.html
✅ /app/layout.tsx (con meta tags PWA)
```

### Verificar en Navegador
```
http://localhost:3000/manifest.json → JSON válido
http://localhost:3000/service-worker.js → JavaScript válido
http://localhost:3000/offline.html → HTML válido
```

---

## 🔟 Script de Verificación Completa

Ejecuta esto en Console:

```javascript
async function checkPWA() {
  console.log('🔍 VERIFICANDO PWA...\n');
  
  // 1. Service Worker
  const regs = await navigator.serviceWorker.getRegistrations();
  console.log(regs.length > 0 ? '✅' : '❌', 'Service Worker:', regs.length > 0);
  
  // 2. Manifest
  const manifest = await fetch('/manifest.json').then(r => r.json());
  console.log('✅ Manifest:', manifest.name);
  
  // 3. Cache
  const caches_list = await caches.keys();
  console.log(caches_list.length > 0 ? '✅' : '❌', 'Cache:', caches_list);
  
  // 4. Meta tags
  const hasTheme = document.querySelector('meta[name="theme-color"]');
  console.log(hasTheme ? '✅' : '❌', 'Theme color meta tag');
  
  const mobileWeb = document.querySelector('meta[name="mobile-web-app-capable"]');
  console.log(mobileWeb ? '✅' : '❌', 'Mobile web app capable');
  
  // 5. Apple touch
  const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
  console.log(appleTouchIcon ? '✅' : '❌', 'Apple touch icon');
  
  console.log('\n✅ Verificación completada');
}

checkPWA();
```

---

## ⚠️ Si Algo No Funciona

### 1. Service Worker No Registra
```bash
# Reinicia servidor
npm run dev

# Limpia cache
rm -rf .next
npm run build
npm start
```

### 2. Manifest  No Carga
```bash
# Verifica que el archivo existe
ls -la public/manifest.json

# Verifica sintaxis JSON
cat public/manifest.json | jq .
```

### 3. Cache Corrupto
```javascript
// En Console - Elimina todo
caches.keys().then(names => {
  return Promise.all(names.map(n => caches.delete(n)));
}).then(() => location.reload(true));
```

### 4. Todavía No Funciona
```bash
# Borra todo local y reinicia
rm -rf .next node_modules
npm install
npm run build
npm start
```

---

## 📊 Estado Esperado Después de Setup

```
✅ Archivo manifest.json presente
✅ Service Worker registrado y activo
✅ Cache creado con nombre "atenea-vX"
✅ Meta tags PWA en HTML
✅ Banner de instalación en dispositivo
✅ App instalable en:
   - Android (Chrome/Edge/Samsung)
   - iOS (Safari)
   - Windows (Chrome/Edge)
   - macOS (Chrome/Safari)
   - Linux (Chrome/Chromium)
```

---

## 📝 Notas de Verificación Útiles

- Service Worker tarda 2-5 seg en registrarse
- El banner de instalación requiere manifest + SW
- Cada cambio en manifest requiere rebuild
- El cache se actualiza automáticamente con versión
- Offline requiere que la ruta esté en URLS_TO_CACHE

---

**Última verificación**: 18 de marzo de 2026
