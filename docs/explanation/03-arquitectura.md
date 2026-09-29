# Arquitectura del Sistema

Visión técnica de la arquitectura de ATENEA.

---

## 1. Stack Tecnológico

### 1.1 Frontend

| Componente | Tecnología | Versión |
|-----------|------------|---------|
| Framework | Next.js | 16.x |
| UI Library | React | 19.x |
| Lenguaje | TypeScript | 5.x |
| Estilos | Tailwind CSS | 4.x |
| State | React hooks | - |
| PWA | next-pwa | - |

### 1.2 Backend

| Componente | Tecnología |
|-----------|------------|
| API | Next.js App Router |
| Runtime | Node.js |
| ORM | Prisma |
| Auth | JWT (jose) |
| Database | SQLite / PostgreSQL |

### 1.3 Desktop

| Componente | Tecnología |
|-----------|------------|
| Runtime | Electron |
| Build | electron-builder |

---

## 2. Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Browser   │  │   PWA     │  │  Electron  │        │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘        │
│        │                │                │                  │
│        └────────────────┴────────────────┘                  │
│                         │                                   │
│                    HTTP/REST                              │
│                         │                                   │
└─────────────────────────┼────────────────────────────────┘
                          │
┌─────────────────────────┼────────────────────────────────┐
│                         ▼                                   │
│  ┌─────────────────────────────────────────────────┐     │
│  │              API ROUTES                          │     │
│  │  /api/auth/*    /api/comandas/*    /api/chicas/* │     │
│  └────────────────────┬────────────────────────────┘     │
│                       │                                   │
│  ┌────────────────────┴────────────────────────────┐     │
│  │           BUSINESS LOGIC                        │     │
│  │  businessRules.ts  validations.ts  reportUtils.ts │     │
│  └────────────────────┬────────────────────────────┘     │
│                       │                                   │
│  ┌────────────────────┴────────────────────────────┐     │
│  │                 PRISMA ORM                    │     │
│  └────────────────────┬────────────────────────────┘     │
│                       │                                   │
│  ┌────────────────────┴────────────────────────────┐     │
│  │            SQLite / PostgreSQL                   │     │
│  └─────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────┘
```

---

## 3. Estructura de Carpetas

```
atenea/
├── app/
│   ├── api/                    # API Routes
│   │   ├── auth/
│   │   ├── comandas/
│   │   ├── chicas/
│   │   ├── categorias/
│   │   ├── caja/
│   │   ├── reportes/
│   │   ├── config/
│   │   ├── stats/
│   │   └── health/
│   │
│   ├── dashboard/               # Frontend pages
│   │   ├── comandas/
│   │   ├── turno/
│   │   ├── chicas/
│   │   ├── caja/
│   │   ├── reportes/
│   │   └── config/
│   │
│   ├── login/
│   ├── layout.tsx
│   └── page.tsx
│
├── components/                  # Componentes React
│   ├── DashboardLayout.tsx
│   ├── Sidebar.tsx
│   ├── Modal.tsx
│   └── organisms/
│       ├── reportes/
│       └── config/
│
├── lib/                       # Utilidades backend
│   ├── prisma.ts             # Cliente Prisma
│   ├── auth.ts              # Autenticación JWT
│   ├── businessRules.ts       # Reglas de negocio
│   ├── validations.ts       # Validaciones
│   ├── formatters.ts       # Formateo de datos
│   ├── exportUtils.ts      # Exportación
│   ├── reportUtils.ts     # Utilidades de reportes
│   └── commission-utils.ts
│
├── prisma/
│   ├── schema.prisma       # Schema de datos
│   ├── migrations/        # Migraciones
│   └── dev.db              # SQLite local
│
├── public/                   # Archivos estáticos
│   └── manifest.json       # PWA manifest
│
├── electron/                 # Desktop (Electron)
│   ├── main.cjs
│   └── preload.cjs
│
└── docs/                     # Documentación
    ├── tutorials/
    ├── how-to/
    ├── reference/
    └── explanation/
```

---

## 4. Flujo de Datos

### 4.1 Creación de Comanda

```
1. USUARIO
   └→ Formulario frontend
        │
2. API ROUTE (POST /api/comandas)
   └→ Validación de campos
        │
3. BUSINESS RULES (calculateComision)
   └→ Cálculo de precio y comisión
        │
4. PRISMA
   └→ INSERT en tabla Comanda
        │
5. RESPONSE
   └→ Comanda creada + relación
```

### 4.2 Autenticación

```
1. USUARIO → POST /api/auth/login
2. AUTH → Verificar password con bcrypt
3. JWT → Generar token (8h expiry)
4. COOKIE → httpOnly, secure en prod
5. FRONTEND → Guardar userId en localStorage
```

---

## 5. Modelos de Datos

### 5.1 Entidades principales

```
Usuario ─────┐
            │ 1:N
            ▼
Comanda ─────┐
    │
    ├── N:1 → Categoria
    │
    ├── N:1 → Chica (chica1)
    │
    ├── N:1 → Chica (chica2)
    │
    └── N:1 → Chica (chicaRecibe)
```

### 5.2 Índices

| Tabla | Índice | Uso |
|-------|--------|-----|
| Comanda | fecha | Filtrado por día |
| Comanda | estado | Filtrado por estado |
| Comanda | clienteNombre | Búsqueda por cliente |
| Categoria | tipo | Filtrado por tipo |

---

## 6. Seguridad

### 6.1 Autenticación

| Componente | Implementación |
|-----------|------------|
| Token | JWT |
| Almacenamiento | Cookie httpOnly |
| Duración | 8 horas |
| Password | bcrypt |

### 6.2 Autorización

| Rol | Permisos |
|-----|---------|
| admin | Total |
| supervisor | Gestion + reportes |
| caja | Solo caja |

### 6.3 Validaciones

- Validación de campos en API route
- Validación de negocio en businessRules
- Sanitización de inputs

---

## 7. API Routes

### 7.1 Estructura de un Route

```typescript
// app/api/comandas/route.ts

export async function GET(request: NextRequest) {
  // 1. Auth
  const user = getUserFromRequest(request)
  if (!user) return 401

  // 2. Params
  const { searchParams } = new URL(request.url)

  // 3. Query
  const comandas = await prisma.comanda.findMany({ ... })

  // 4. Response
  return NextResponse.json(comandas)
}

export async function POST(request: NextRequest) {
  // 1. Auth
  // 2. Parse body
  // 3. Validations
  // 4. Business logic
  // 5. DB transaction
  // 6. Response
}
```

### 7.2 Manejo de Errores

```typescript
// Errores conocidos
return NextResponse.json({ error: 'Mensaje' }, { status: 400 })

// Errores de Prisma
if (isPrismaNotFound(error)) return 404

// Errores inesperados
console.error(...)
return 500
```

---

## 8. PWA

### 8.1 Características

| Feature | Implementación |
|---------|---------------|
| Offline | Service Worker |
| Installable | manifest.json |
| Cache | Workbox |

### 8.2 Service Worker Events

```
install → Cache assets
activate → Clean old caches
fetch → Network first / Cache fallback
```

---

## 9. Deployment

### 9.1 Desarrollo

```bash
npm run dev
# http://localhost:3000
```

### 9.2 Producción (Vercel)

```bash
npm run build
vercel deploy
```

### 9.3 Desktop (Electron)

```bash
npm run build:electron
npm run dist:electron
```

---

## 10. Rendimiento

### 10.1 Optimizaciones

| Área | Optimización |
|------|-------------|
| Database | Índices apropiados |
| API | Límite de resultados (500) |
| Frontend | SSR + client hydration |
| Assets | next/image optimization |

### 10.2 Consideraciones

- SQLite suficiente para desarrollo y uso ligero
- PostgreSQL para múltiples usuarios concurrentes
- PWA cachea recursos estáticos

---

## Referencias

- [API Endpoints](./../reference/01-api-endpoints.md)
- [Database Schema](./../reference/02-database-schema.md)
- [businessRules.ts](../../lib/businessRules.ts)

---

*Última actualización: Abril 2026*