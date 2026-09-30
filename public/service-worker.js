const CACHE_NAME = 'atenea-v4';
const URLS_TO_CACHE = [
  '/',
  '/login',
  '/dashboard',
  '/offline.html',
  '/brand/atenea-logo.svg',
  '/icon-192.png',
];

// Instalación del service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching essential files');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activación - limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Estrategia: Network First para paginas y API, Cache First para assets
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);
  // Solo requests propias por http(s): ignora chrome-extension://, CDNs, etc.
  if (!url.protocol.startsWith('http') || url.origin !== self.location.origin) {
    return;
  }
  const { pathname } = url;

  // Paginas HTML: Network First, para que un deploy nuevo se vea al recargar
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // API requests: Network First
  if (pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok) {
            // Clone immediately before returning response to avoid bodyUsed errors.
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version if offline
          return caches.match(event.request).then((cached) => {
            return cached || new Response(
              JSON.stringify({ error: 'Offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static assets: Cache First
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
            return response;
          })
          .catch(() => {
            // Fallback para páginas HTML
            if (event.request.destination === 'document') {
              return caches.match('/offline.html');
            }
            return new Response('Not Found', { status: 404 });
          })
      );
    })
  );
});

// Background sync (futuro: sync comandas cuando conexión se restablezca)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-comandas') {
    event.waitUntil(syncComandas());
  }
});

async function syncComandas() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      if (request.url.includes('/api/comandas') && request.method === 'POST') {
        try {
          await fetch(request);
          await cache.delete(request);
        } catch (err) {
          console.log('[ServiceWorker] Sync failed, will retry later');
        }
      }
    }
  } catch (err) {
    console.error('[ServiceWorker] Sync error:', err);
  }
}
