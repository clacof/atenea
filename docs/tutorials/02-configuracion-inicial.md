# Configuración Inicial del Sistema

Guía para administradores para configurar ATENEA desde cero.

**Audiencia:** Administradores del sistema, técnicos de soporte
**Requisitos:** Acceso al servidor, permisos de administrador
**Tiempo estimado:** 30 minutos

---

## 1. Requisitos del Sistema

### 1.1 Software necesario

| Componente | Versión mínima |
|------------|----------------|
| Node.js | 18.x |
| npm | 9.x |
| Navegador | Chrome/Firefox/Safari última versión |

### 1.2 Hardware recomendado

- **Desarrollo:** Laptop/desktop con 4GB RAM mínimo
- **Producción:** Servidor con 2CPU, 4GB RAM, 20GB disco

---

## 2. Instalación

### 2.1 Clonar el repositorio

```bash
git clone <repositorio-atenea>
cd atenea
```

### 2.2 Instalar dependencias

```bash
npm install
```

### 2.3 Configurar variables de entorno

Crea el archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tu configuración:

```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="tu-secreto-unico-aqui"
```

> **Importante:** En producción, usa una base de datos PostgreSQL y un JWT_SECRET seguro (mínimo 32 caracteres).

---

## 3. Base de Datos

### 3.1 Migraciones

Ejecuta las migraciones para crear las tablas:

```bash
npx prisma migrate deploy
```

### 3.2 Seed (datos iniciales)

Carga los datos de prueba:

```bash
npm run db:seed
```

Esto crea:
- Usuario administrador: `admin@atenea.com` / `admin123`
- Categorías predefinidas
- Configuración por defecto

### 3.3 Verificar instalación

Abre Prisma Studio para inspeccionar la base:

```bash
npx prisma studio
```

Accede a http://localhost:5555 para ver los datos.

---

## 4. Configuración Inicial

### 4.1 Acceder a configuración

1. Inicia el servidor: `npm run dev`
2. Abre http://localhost:3000
3. Inicia sesión como administrador
4. Ve a **Config** en el menú

### 4.2 Parámetros esenciales

| Parámetro | Descripción | Valor típico |
|-----------|--------------|--------------|
| `horaCambioAfter` | Hora de inicio afterhour (formato HH:mm) | "04:00" |
| `maxChicasBottella` | Chicas máximas por botella | 2 |
| `comisionNormalFija` | Comisión estándar | 5000 |
| `comisionPremiumFija` | Comisión para premium | 8000 |

### 4.3 Configurar categorías

En **Categorías**, agrega los productos del bar:

1. Haz clic en **Nueva Categoría**
2. Ingresa nombre (ej: "Cerveza", "Whisky 12 años")
3. Selecciona tipo: **Trago** o **Botella**
4. Configura precios y comisiones

#### Ejemplo: Categoría "Cerveza"

| Campo | Valor |
|-------|-------|
| Nombre | Cerveza |
| Tipo | trago |
| Precio cliente | 8000 |
| Precio chica | 4000 |
| Comisión | 3000 |

#### Ejemplo: Botella "Blue Label"

| Campo | Valor |
|-------|-------|
| Nombre | Blue Label |
| Tipo | botella |
| Precio | 150000 |
| Comisión | 30000 |
| Solo transferencia | true |

---

## 5. Gestión de Usuarios

### 5.1 Roles disponibles

| Rol | Permisos |
|-----|----------|
| `admin` | Acceso total, configuración, reportes |
| `supervisor` | Gestión de comandas, cajas, reportes |
| `caja` | Solo caja y reportes básicos |

### 5.2 Crear usuario

1. Ve a **Usuarios** (solo admins)
2. Haz clic en **Nuevo Usuario**
3. Completa los datos:
   - Nombre completo
   - Email (único)
   - Contraseña
   - Rol

---

## 6. Modo Producción

### 6.1 Build

```bash
npm run build
```

### 6.2 Iniciar servidor

```bash
npm start
```

### 6.3 Variables de producción

Configura en `.env.production`:

```env
DATABASE_URL="postgresql://user:password@host:5432/atenea"
JWT_SECRET="secreto-muy-seguro-mínimo-32-caracteres"
NODE_ENV="production"
```

---

## 7. Integración Desktop (Electron)

### 7.1 Instalar dependencias extra

```bash
npm install electron electron-builder --save-dev
```

### 7.2 Scripts disponibles

```bash
npm run electron:dev    # Modo desarrollo
npm run build:electron   # Compilar executable
npm run dist:electron   # Generar instalador
```

---

## 8. Verificación Final

### 8.1 Checklist de instalación

- [ ] `npm install` completado sin errores
- [ ] `npx prisma migrate deploy` exitoso
- [ ] `npm run db:seed` completado
- [ ] Login funcional con admin@atenea.com
- [ ] Categorías visibles en el dashboard
- [ ] Puedo crear una comanda de prueba
- [ ] Puedo cerrar una cuenta

### 8.2 Endpoints de verificación

```bash
# Health check
curl http://localhost:3000/api/health

# Stats
curl http://localhost:3000/api/stats
```

---

## Referencias

- [Referencia de Configuración](./reference/configuracion.md)
- [Schema de Base de Datos](./reference/database-schema.md)
- [Arquitectura del Sistema](./explanation/arquitectura.md)

---

*Última actualización: Abril 2026*