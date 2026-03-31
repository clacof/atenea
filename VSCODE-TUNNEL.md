# Compartir la app con VS Code Tunnel

## Opcion recomendada: Port Forwarding en VS Code

1. Ejecuta la app:

```bash
npm run dev
```

2. Abre el panel PORTS en VS Code.
3. Forward del puerto 3000.
4. Usa Share Port para generar URL publica.
5. Comparte el enlace generado.

## Opcion CLI

```bash
code tunnel --accept-server-license-terms --name atenea-share
```

## Verificacion

- El enlace abre el login
- Las rutas /dashboard y /api/health responden
- Si falla, reiniciar dev server y repetir el forward