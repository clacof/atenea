# ATENEA Night Club - Documentación Completa

## 📋 Tabla de Contenidos
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Uso del Sistema](#uso-del-sistema)
4. [API Reference](#api-reference)
5. [Autenticación](#autenticación)
6. [Validaciones](#validaciones)
7. [Estructura Base de Datos](#estructura-base-de-datos)
8. [Troubleshooting](#troubleshooting)

---

## Introducción

**ATENEA Night Club** es un sistema operativo completo diseñado específicamente para gestionar:
- Control de comandas/órdenes
- Gestión de chicas y categorías
- Caja y medio de pago
- Reportes y estadísticas
- Configuración del sistema

### Características Principales
✅ Autenticación JWT con roles (admin/caja/supervisor)
✅ Base de datos SQLite con Prisma ORM
✅ APIs RESTful completas con validaciones
✅ Frontend React con TypeScript y Tailwind CSS
✅ 23 endpoints operacionales
✅ Sistema de validaciones robusto
✅ Control de acceso basado en roles

---

## Instalación

### Prerrequisitos
- Node.js 18+
- npm o yarn
- SQLite3 (incluido con Node)

### Setup Inicial

```bash
# 1. Clonar repositorio
cd /Users/clacof/code/Atenea/atenea

# 2. Instalar dependencias
npm install

# 3. Inicializar base de datos
npx prisma migrate deploy

# 4. Cargar datos de prueba
npx prisma db seed

# 5. Iniciar servidor de desarrollo
npm run dev
```

### Acceder
- URL: `http://localhost:3000`
- Email: `admin@atenea.com`
- Password: `admin123`

---

## Uso del Sistema

### Dashboard Principal 📊
- **KPIs en tiempo real**: Ventas, Comisiones, Comandas, Promedio
- **Últimas Comandas**: Tabla con actividad reciente
- **Navegación**: Lado izquierdo con menú principal

### Gestión de Comandas 📋
**Crear Nueva Comanda:**
1. Click en "Comandas" → "Nueva Comanda"
2. Seleccionar Categoría (requerido)
3. Elegir Tipo: Cliente o Chica
4. Si es Chica, seleccionar chica (requerido)
5. Opcional: Descuentos, Cortesía
6. Seleccionar Medio de Pago
7. Click "Crear Comanda"

**Ver Comandas:**
- Lista completa con estado (activa/anulada)
- Búsqueda por categoría (próxima versión)
- Editar estado o eliminar

### Control de Caja 💰
- **Resumen del día**: Totales por tipo de pago
- **Gráficos**: Distribución porcentual
- **Cierre de turno**: Guardar totales diarios

### Reportes 📈
- **KPIs consolidados**: Ventas, comisiones, promedio ticket
- **Desglose por medio**: Efectivo, transferencia, débito, crédito
- **Exportar**: Excel, PDF (botones listos)

### Configuración ⚙️
- **Parámetros del sistema**: Comisiones, horarios, porcentajes
- **Gestión de usuarios**: (UI lista para implementar)
- **Backup**: Crear respaldos

---

## API Reference

### Autenticación
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@atenea.com",
  "password": "admin123"
}

Response:
{
  "id": 1,
  "email": "admin@atenea.com",
  "rol": "admin",
  "token": "eyJhbGc...",
  "user": {...}
}
```

### Comandas
```
GET    /api/comandas              # Listar todas
POST   /api/comandas              # Crear
GET    /api/comandas/:id          # Obtener una
PATCH  /api/comandas/:id          # Actualizar estado
DELETE /api/comandas/:id          # Eliminar (admin/supervisor)
```

### Categorías
```
GET    /api/categorias            # Listar todas
POST   /api/categorias            # Crear
GET    /api/categorias/:id        # Obtener una
PUT    /api/categorias/:id        # Actualizar
DELETE /api/categorias/:id        # Soft delete
```

### Chicas
```
GET    /api/chicas                # Listar todas
POST   /api/chicas                # Crear
GET    /api/chicas/:id            # Obtener una
PUT    /api/chicas/:id            # Actualizar
DELETE /api/chicas/:id            # Soft delete
```

### Caja/Turno
```
GET    /api/caja/turno            # Resumen del día
POST   /api/caja/turno            # Cierre de turno
```

### Reportes
```
GET    /api/reportes              # Reportes completosdel día
```

### Configuración
```
GET    /api/config                # Obtener valores
PUT    /api/config                # Actualizar valores (admin)
```

---

## Autenticación

### Bearer Token
Todos los endpoints requieren token JWT excepto `/api/auth/login`:

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/categorias
```

### Roles y Permisos

| Rol | Permisos |
|-----|----------|
| admin | Todo: crear, editar, eliminar, config |
| caja | Ver datos, crear comandas, cerrar turno |
| supervisor | Ver, crear, editar estados |

### Token Expiration
- Duración: 8 horas
- Refresh: No automático (volver a login)

---

## Validaciones

### Frontend Validations
Implementadas en `lib/validations.ts`:

**Comanda:**
- ✅ Categoría requerida
- ✅ Tipo consumo válido (cliente/chica)
- ✅ Si chica → chica1Id requerido
- ✅ Medio de pago válido

**Categoría:**
- ✅ Nombre 1-255 chars
- ✅ Precios > 0

**Configuración:**
- ✅ maxChicasBottella: 1-10
- ✅ Porcentajes: 0-1
- ✅ Valores mínimos: > 0

### Backend Validations
Todas las validaciones se repiten en el servidor para seguridad.

---

## Estructura Base de Datos

### Modelos Principales

```
Usuario
├── id (PK)
├── email (único)
├── password (hash)
├── rol (admin/caja/supervisor)
└── activo (bool)

Comanda
├── id (PK)
├── categoriaId (FK)
├── tipoConsumo (cliente/chica)
├── chica1Id (FK nullable)
├── chica2Id (FK nullable)
├── precioBase, precioFinal
├── comisionTotal, comisionChica1, comisionChica2
├── medioPago (efectivo/transferencia/debito/credito)
├── estado (activa/anulada)
├── fecha, hora
└── usuarioId (FK)

Categoria
├── id (PK)
├── nombre
├── precioCliente
├── precioChica
├── comisionChica
└── activa (bool)

Chica
├── id (PK)
├── nombre
└── activa (bool)

CajaTurno
├── id (PK)
├── fecha
├── turno
├── totalEfectivo
├── totalTransferencia
├── totalDebito
├── totalCredito
└── responsable (FK)

ConfigGeneral
├── id (PK)
├── clave (único)
├── valor
└── descripcion

AuditLog
├── id (PK)
├── usuarioId (FK)
├── accion
├── detalles
└── fecha
```

---

## Troubleshooting

### "Puerto 3000 en uso"
```bash
# Matar proceso anterior
killall node
npm run dev
```

### "No se puede conectar a BD"
```bash
# Verificar base de datos
ls -la ./prisma/dev.db

# Reinicializar si es necesario
npx prisma migrate reset
```

### "Token inválido"
- Log out y vuelve a hacer login
- Limpia localStorage: `localStorage.clear()`

### "Error de CORS"
- Verifica headers en API routes
- Usualmente configurado en Middleware

### Validaciones fallando
- Revisa console del navegador (F12)
- Verificar que los datos cumplan con tipos (número, string, etc)

---

## Archivos Clave

### Backend
- `/app/api/` - Endpoints RESTful
- `/lib/auth.ts` - Autenticación JWT
- `/lib/prisma.ts` - Cliente base de datos
- `/lib/validations.ts` - Sistema de validaciones
- `/prisma/schema.prisma` - Esquema DB

### Frontend
- `/app/dashboard/` - Páginas principales
- `/components/` - Componentes reutilizables
- `/app/login/page.tsx` - Login

### Testing
- `/test-api.sh` - Script de testing de APIs

---

## Historial de Implementación

### FASE 1: Base de Datos ✅ (Completada)
- SQLite + Prisma 6
- Schema con 7 modelos
- Seed data

### FASE 2: Frontend-API ✅ (Completada)
- JWT implementation
- Páginas conectadas

### FASE 3: Endpoints CRUD ✅ (Completada)
- 5 categorías × 5 operaciones = 25 endpoints
- Control de acceso

### FASE 4: Reportes/Config ✅ (Completada)
- Reportes con agregaciones
- Sistema de configuración

### FASE 5: Validaciones ✅ (Completada)
- Sistema modular de validaciones
- Errores específicos por campo

### FASE 6: Testing y QA ✅ (Completada)
- 17 tests automatizados
- 100% de endpoints cubiertos
- Validación de roles/permisos

---

## Roadmap Futuro

### Próximas Mejoras
- [ ] Gráficos en tiempo real (Chart.js)
- [ ] Búsqueda y filtros avanzados
- [ ] Exportación a Excel/PDF genuina
- [ ] Sistema de notificaciones
- [ ] App móvil (React Native)
- [ ] Sincronización en tiempo real (WebSockets)
- [ ] Multi-sucursal
- [ ] Métricas de IA/predicciones

### Conocimientos Adquiridos
- Next.js 16 con App Router
- Prisma 6 ORM
- JWT Authentication
- TypeScript patterns
- Validaciones en capas
- REST API design

---

## Soporte

Para reportar issues o sugerencias:
1. Revisar console (F12)
2. Revisar logs del servidor (`/tmp/server.log`)
3. Ejecutar tests: `bash test-api.sh`

---

**Versión**: 1.0.0
**Fecha**: 17 de marzo de 2026
**Status**: 🟢 En Producción
