# Agentes para Atenea

Agent definitions para el proyecto Atenea (Night Club Management System).

## agent:atenea-backend

Maneja lógica de backend, API routes, Prisma, y reglas de negocio.

Capabilities:
- API routes en app/api/**/route.ts
- Modelos Prisma en prisma/schema.prisma
- Reglas de negocio en lib/businessRules.ts
- Validaciones en lib/validations.ts
- Reportes en lib/reportUtils.ts

Aliases: api, backend, prisma

## agent:atenea-frontend

Maneja componentes React, páginas del dashboard, y UI.

Capabilities:
- Páginas en app/dashboard/**/page.tsx
- Componentes en components/**
- Autenticación client en lib/client-auth.ts
- Utilidades de formatting en lib/formatters.ts

Aliases: ui, frontend, dashboard, react

## agent:atenea-db

Maneja base de datos, migraciones, seed, y configuraciones.

Capabilities:
- Migraciones en prisma/migrations/**
- Schema en prisma/schema.prisma
- Seed en app/seed.ts
- Configuraciones de ciclos en lib/reportUtils.ts

Aliases: database, db, prisma, seed

## agent:atenea-electron

Maneja integración desktop con Electron.

Capabilities:
- Configuración Electron en electron/main.cjs
- Build y distribución
- Scripts en package.json (electron:dev, build:electron, dist:electron)

Aliases: desktop, electron, electron-builder

## agent:atenea-reportes

Especializado en reportes y estadísticas.

Capabilities:
- Reportes filtrados en app/api/reportes/**
- Utilidades de exportación en lib/exportUtils.ts
- Gráficos y visualizaciones
- Estadísticas en app/api/stats/route.ts

Aliases: reportes, stats, charts, export

## Configuración del proyecto

 Scripts útiles:
- `npm run dev` - Desarrollo
- `npm run lint` - Verificar lint
- `npm run db:seed` - Seed base de datos
- `npx prisma studio` - UI de Prisma

 Endpoints principales:
- /api/auth/login, /api/auth/logout
- /api/comandas, /api/comandas/[id], /api/comandas/turno-activo
- /api/chicas, /api/chicas/[id]
- /api/categorias, /api/categorias/[id]
- /api/caja/turno
- /api/reportes, /api/reportes/filtrado
- /api/config
- /api/stats
- /api/health