# ATENEA Desktop (Electron)

Esta guia explica como correr ATENEA como app de escritorio y como publicar actualizaciones.

## 1. Que se implemento

- Electron abre una ventana nativa y ejecuta Next.js dentro de la app.
- En desktop, la base SQLite vive en `userData` de Electron (persistente por usuario).
- La URL local es `http://localhost:3000` y el backend sigue siendo tus rutas API de Next.

Archivo principal de Electron:

- `electron/main.cjs`

## 2. Scripts disponibles

En `package.json` quedaron estos scripts:

- `npm run dev:electron`: levanta Next en dev y abre Electron.
- `npm run start:electron`: abre Electron en modo produccion (requiere build previo).
- `npm run build:electron`: compila Next y prepara paquete sin instalador final.
- `npm run dist:electron`: compila y genera instaladores (`release/`).

## 3. Primer arranque recomendado

1. Instalar dependencias:

```bash
npm install
```

2. Mantener tus migraciones Prisma al dia:

```bash
npx prisma migrate deploy
npm run db:seed
```

3. Ejecutar desktop en desarrollo:

```bash
npm run dev:electron
```

## 4. Build de escritorio

Generar instaladores locales:

```bash
npm run dist:electron
```

Salida esperada:

- Carpeta `release/`
- macOS: `.dmg` y `.zip`
- Windows: instalador NSIS
- Linux: `AppImage`

## 5. Donde queda la base de datos en desktop

Electron define:

- `DATABASE_URL=file:<userData>/atenea.db`

Por eso cada instalacion usa su propio archivo SQLite persistente del sistema operativo.

## 6. Como actualizar la app

Tienes dos niveles de actualizacion:

### A) Actualizacion manual (lista para usar ya)

1. Subes una nueva version de codigo.
2. Cambias `version` en `package.json`.
3. Ejecutas `npm run dist:electron`.
4. Distribuyes el nuevo instalador.
5. Usuario instala encima de la version anterior.

Esto conserva los datos si no cambias la ubicacion de `userData`.

### B) Auto-update (siguiente fase)

Para auto-update real necesitas:

1. Hospedar artefactos de release (GitHub Releases, S3, etc.).
2. Firmado de app (muy importante en macOS/Windows).
3. Integrar `electron-updater` y feed URL.

Si quieres, en un siguiente paso te dejo eso montado con GitHub Releases.

## 7. Flujo de release recomendado

1. Incrementar version semantica (`0.1.0` -> `0.1.1`).
2. Ejecutar tests/lint/build web.
3. Ejecutar `npm run dist:electron`.
4. Probar instalador en limpio.
5. Publicar instalador y changelog.

## 8. Notas operativas

- En desarrollo, Electron espera a que Next este listo en puerto 3000.
- Si el puerto esta ocupado, libera 3000 o define `PORT` antes de iniciar.
- En produccion, Electron inicia su propio `next start` embebido.
