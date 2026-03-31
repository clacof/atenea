# Quick Start - ATENEA

## 1) Instalar dependencias

```bash
npm install
```

## 2) Base de datos

```bash
npx prisma migrate deploy
npm run db:seed
```

## 3) Ejecutar en desarrollo

```bash
npm run dev
```

## 4) Entrar al sistema

- URL: http://localhost:3000
- Usuario: admin@atenea.com
- Password: admin123

## 5) Flujo recomendado de prueba

1. Login
2. Ir a Turno Activo
3. Crear comanda desde Nueva Comanda
4. Volver a Turno Activo
5. Cerrar cuenta del cliente
6. Revisar Caja y Reportes

## 6) Comandos utiles

```bash
# Type check
npx tsc --noEmit

# Build de produccion
npm run build

# Si falla por cache de Next/Turbopack
pkill -f 'node|next' || true
rm -rf .next node_modules/.cache node_modules/.turbopack
npm run dev
```