# Guia PWA - Estado Real

## Implementacion actual

El proyecto incluye soporte base de PWA:
- public/manifest.json
- public/service-worker.js
- public/offline.html
- registro de service worker en app/layout.tsx

## Que funciona hoy

- Manifest disponible en /manifest.json
- Service worker registrado en navegador compatible
- Cache basica de rutas clave
- Fallback offline hacia /offline.html para navegacion sin red

## Limitaciones actuales

- No hay flujo robusto de cola transaccional offline para crear comandas
- El bloque de background sync existe como base tecnica, pero no cubre un flujo completo de reintentos de negocio
- Se recomienda operacion online para evitar inconsistencias

## Verificacion rapida

1. Abrir DevTools > Application
2. Validar Service Workers: activated
3. Validar Cache Storage: atenea-v2
4. Probar offline en Network y recargar una ruta cacheada

## Buenas practicas

- Para cambios de SW, incrementar version de cache
- Evitar cachear respuestas sensibles de autenticacion
- Probar instalacion en Chrome y Safari por separado

## Nota

Si se requiere una PWA de operacion offline real, se debe implementar cola persistente en IndexedDB con reintentos y resolucion de conflictos.