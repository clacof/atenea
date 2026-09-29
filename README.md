# ATENEA Night Club

Sistema operativo interno para gestion de comandas, caja y reportes.

## Estado Actual

- App web con Next.js App Router
- Backend en API routes de Next.js
- Base de datos SQLite con Prisma
- Autenticacion con cookie httpOnly (JWT)
- Vista de Turno Activo con disponibilidad en vivo
- Reglas de negocio para afterhour y botellas con acompanantes

## Requisitos

- Node.js 18+
- npm
- DATABASE_URL configurada (por defecto SQLite local)

## Inicio Rapido

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Acceso local:
- URL: http://localhost:3000
- Usuario: admin@atenea.com
- Password: admin123

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:seed
```

## Modulos Principales

- Comandas: creacion, listado, cierre y anulacion
- Turno activo: clientes abiertos, subtotal por cliente, cierre de cuenta
- Chicas: disponibilidad en tiempo real por asignacion activa
- Categorias: tragos, botellas, flag de afterhour
- Caja y reportes: resumen diario y agregados
- Configuracion: parametros operativos en base de datos

## Endpoints Principales

- Auth: POST /api/auth/login, POST /api/auth/logout
- Comandas: GET/POST /api/comandas, GET/PATCH/DELETE /api/comandas/:id
- Turno activo: GET/POST /api/comandas/turno-activo
- Categorias: GET/POST /api/categorias, GET/PUT/DELETE /api/categorias/:id
- Chicas: GET/POST /api/chicas, GET/PUT/DELETE /api/chicas/:id
- Caja: GET/POST /api/caja/turno
- Reportes: GET /api/reportes
- Config: GET/PUT /api/config
- Operativos: GET /api/stats, GET /api/health
- Utilidad dev: POST /api/setup, POST /api/seed

## Documentacion

Documentación completa basada en el marco [Diátaxis](https://diataxis.fr/):

### Guia rapida
- [docs/README.md](docs/README.md) - Índice principal
- [docs/tutorials/01-inicio-operador.md](docs/tutorials/01-inicio-operador.md) - Tutorial para operadores
- [docs/tutorials/02-configuracion-inicial.md](docs/tutorials/02-configuracion-inicial.md) - Setup inicial

### Documentacion existente
- DOCUMENTATION.md - Documentación técnica legacy
- QUICK-START.md - Arranque rápido legacy
- ELECTRON-GUIDE.md - Electron desktop
- PWA-GUIDE.md / PWA-CHECKLIST.md - PWA
- VSCODE-TUNNEL.md - Compartir por tunnel