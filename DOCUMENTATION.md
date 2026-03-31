# ATENEA Night Club - Documentacion Tecnica

## 1. Resumen

ATENEA es una aplicacion para operacion diaria de nightclub con foco en:
- comandas por cliente
- asignacion de chicas
- reglas de comision
- control de caja
- reportes diarios

Stack principal:
- Next.js 16
- React 19
- TypeScript
- Prisma 6 + SQLite

## 2. Setup

```bash
npm install
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Produccion local:

```bash
npm run build
npm run start
```

## 3. Autenticacion y Sesion

- Login: POST /api/auth/login
- Logout: POST /api/auth/logout
- El token se guarda en cookie httpOnly (token)
- Duracion de sesion: 8 horas
- Cliente guarda datos auxiliares en localStorage (usuario y expiracion)

## 4. Reglas de Negocio Clave

### 4.1 Cliente correlativo diario

- Formato esperado: C1, C2, C3...
- El correlativo se calcula por dia desde /api/comandas/turno-activo

### 4.2 Disponibilidad de chicas

- Una chica se considera ocupada si esta en una comanda activa del dia
- Se bloquea asignar una chica ocupada por otro cliente

### 4.3 Afterhour

- La categoria define isAfterhour
- Si isAfterhour=true, la comision para chicas es 0

### 4.4 Botellas con acompanantes

- Para categoria tipo botella y consumo cliente:
- Se permite delta por chicas adicionales
- La comision por acompanante es configurable (comisionAcompananteBotella)
- Se valida maximo permitido por configuracion

## 5. API Reference

### 5.1 Auth
- POST /api/auth/login
- POST /api/auth/logout

### 5.2 Comandas
- GET /api/comandas
- POST /api/comandas
- GET /api/comandas/:id
- PATCH /api/comandas/:id
- DELETE /api/comandas/:id
- GET /api/comandas/turno-activo
- POST /api/comandas/turno-activo

### 5.3 Catalogos
- GET /api/categorias
- POST /api/categorias
- GET /api/categorias/:id
- PUT /api/categorias/:id
- DELETE /api/categorias/:id
- GET /api/chicas
- POST /api/chicas
- GET /api/chicas/:id
- PUT /api/chicas/:id
- DELETE /api/chicas/:id

### 5.4 Operacion
- GET /api/caja/turno
- POST /api/caja/turno
- GET /api/reportes
- GET /api/stats
- GET /api/health
- GET /api/config
- PUT /api/config

### 5.5 Utilidades de desarrollo
- POST /api/setup
- POST /api/seed

## 6. Configuracion Persistente (ConfigGeneral)

Claves activas:
- horaCambioAfter
- maxChicasBottella
- porcBottella100k
- porcBottella150kMas
- minValor150k
- comisionPremiumFija
- comisionNormalFija
- comisionAcompananteBotella

## 7. Modelos de Datos (Resumen)

- Usuario
- Categoria (incluye tipo e isAfterhour)
- Chica
- Comanda (incluye clienteNombre, estado, comisiones)
- CajaTurno
- ConfigGeneral
- AuditLog

Ver esquema fuente en prisma/schema.prisma.

## 8. Frontend

Pantallas principales:
- /login
- /dashboard
- /dashboard/comandas
- /dashboard/comandas/nueva
- /dashboard/turno
- /dashboard/chicas
- /dashboard/categorias
- /dashboard/caja
- /dashboard/reportes
- /dashboard/config

## 9. Troubleshooting

### Error de chunks de Turbopack

```bash
pkill -f 'node|next' || true
rm -rf .next node_modules/.cache node_modules/.turbopack
npm run dev
```

### Puerto en uso

```bash
lsof -ti tcp:3000 tcp:3001 | xargs kill -9
npm run dev
```

### Prisma no actualizado

```bash
npx prisma migrate deploy
npx prisma generate
```

## 10. Estado de Documentacion

- Version documento: 1.2.0
- Fecha: 19-03-2026
- Estado: vigente con codigo actual del repositorio