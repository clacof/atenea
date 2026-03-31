# PWA Checklist

## Basico

- [x] manifest.json existe
- [x] service-worker.js existe
- [x] offline.html existe
- [x] registro de SW en layout

## Validacion en navegador

- [ ] Service worker en estado activated
- [ ] Cache creada con nombre esperado (atenea-v2)
- [ ] /manifest.json sin errores
- [ ] Instalacion disponible en navegador compatible

## Pruebas funcionales

- [ ] Navegacion offline muestra offline.html
- [ ] Al volver online, la app recupera datos de API
- [ ] No hay errores JS del SW en consola

## Seguridad y estabilidad

- [ ] Revisar que no se cacheen endpoints sensibles
- [ ] Versionar cache en cada cambio de estrategia
- [ ] Limpiar caches viejos en activate

## Alcance

Este checklist valida PWA basica. No certifica operacion transaccional offline completa.