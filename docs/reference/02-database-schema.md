# Schema de Base de Datos

Documentación técnica del schema Prisma de ATENEA.

**Audiencia:** Desarrolladores
**Base:** SQLite/PostgreSQL con Prisma ORM

---

## Diagrama de Entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Usuario   │────<│  Comanda  │>────│ Categoria │
└─────────────┘     └───────────┼───┘ └─────────────┘
                           │
              ┌────────────┼────────────┐
              │           │          │
              ▼           ▼          ▼
        ┌─────────┐ ┌─────────┐ ┌────────���────┐
        │ Chica1  │ │ Chica2  │ │ ChicaComis │
        └─────────┘ └─────────┘ └───────────┘

┌─────────────┐     ┌─────────────┐
│ConfigGeneral│     │ CajaTurno  │
└─────────────┘     └─────────────┘

┌─────────────┐
│ AuditLog   │
└─────────────┘
```

---

## Enums

### Rol

Roles de usuario del sistema.

```prisma
enum Rol {
  admin      // Acceso total
  caja       // Solo caja
  supervisor // Gestión y reportes
}
```

---

### TipoConsumo

Quién consume el producto.

```prisma
enum TipoConsumo {
  cliente // Pagado por el cliente
  chica   // Consumo propio de la chica
}
```

---

### MedioPago

Método de pago.

```prisma
enum MedioPago {
  efectivo      // Dinero físico
  transferencia // Pago electrónico
  debito       // Tarjeta débito
  credito      // Tarjeta crédito (+ recargo)
}
```

---

### TipoCategoria

Tipo de producto.

```prisma
enum TipoCategoria {
  trago    // Bebida individual
  botella  // Botella completa
}
```

---

### EstadoComanda

Estado de la comanda.

```prisma
enum EstadoComanda {
  activa   // Pendiente de pago
  pagada   // Cerrada y cobrada
  anulada  // Cancelada
}
```

---

## Modelos

### ConfigGeneral

Parámetros de configuración del sistema.

```prisma
model ConfigGeneral {
  id          Int     @id @default(autoincrement())
  clave       String  @unique
  valor       String
  descripcion String?
}
```

**Claves disponibles:**

| Clave | Tipo | Default | Descripción |
|-------|------|---------|-----------|
| horaCambioAfter | string | "04:00" | Hora inicio afterhour |
| maxChicasBottella | int | 2 | Chicas máx. por botella |
| porcBottella100k | float | 0.4 | % comisión <150k |
| porcBottella150kMas | float | 0.3 | % comisión ≥150k |
| minValor150k | int | 150000 | Umbral 150k |
| comisionNormalFija | int | 5000 | Comisión estándar |
| comisionPremiumFija | int | 8000 | Comisión premium |
| comisionAcompananteBotella | int | 5000 | Por acompanhante |

---

### Categoria

Productos del bar.

```prisma
model Categoria {
  id                    Int            @id @default(autoincrement())
  nombre                String
  tipo                  TipoCategoria  @default(trago)
  isAfterhour           Boolean        @default(false)
  precioCliente         Int?           // Para tragos
  precioChica           Int?           // Para tragos
  comisionChica         Int?           // Para tragos
  precio                Int?           // Para botellas
  comision              Int?           // Comisión瓶子
  recargoCreditoCliente Int?           // Recargo crédito (cliente)
  recargoCreditoChica   Int?           // Recargo crédito (chica)
  soloTransferencia     Boolean        @default(false) // Solo transferencia
  activa                Boolean        @default(true)
  comandas              Comanda[]
}
```

**Relaciones:**
- Categoria → Comanda (1:N)

**Índices:**
- Ninguno adicional

---

### Usuario

Usuarios del sistema.

```prisma
model Usuario {
  id           Int       @id @default(autoincrement())
  nombre       String
  email        String    @unique
  passwordHash String
  rol          Rol
  activo       Boolean   @default(true)
  ultimoLogin  DateTime?
  comandas     Comanda[]
}
```

**Relaciones:**
- Usuario → Comanda (1:N)

**Índices:**
- email (único)

---

### Chica

Personal femenino.

```prisma
model Chica {
  id           Int       @id @default(autoincrement())
  nombre       String
  activa       Boolean   @default(true)
  fechaIngreso DateTime  @default(now())
  comandas1    Comanda[] @relation("Chica1")
  comandas2    Comanda[] @relation("Chica2")
  comisionesRecibidas Comanda[] @relation("ComisionChica")
}
```

**Relaciones:**
- Chica → Comanda (1:N via chica1Id)
- Chica → Comanda (1:N via chica2Id)
- Chica → Comanda (1:N via chicaRecibeComisionId)

**Índices:**
- Ninguno adicional

---

### Comanda

Registro de consumo.

```prisma
model Comanda {
  id                  Int             @id @default(autoincrement())
  fecha               DateTime        @default(now())
  hora                String
  categoriaId         Int
  categoria           Categoria       @relation(...)
  tipoConsumo         TipoConsumo
  chica1Id            Int?
  chica1              Chica?          @relation("Chica1", ...)
  chica2Id            Int?
  chica2              Chica?          @relation("Chica2", ...)
  chica1Liberada      Boolean         @default(false)
  chica2Liberada      Boolean         @default(false)
  chicaRecibeComisionId Int?
  chicaRecibeComision  Chica?          @relation("ComisionChica", ...)
  precioBase          Int
  precioFinal         Int
  comisionTotal       Int
  comisionChica1      Int?
  comisionChica2      Int?
  descuentoPorcentaje Float?
  descuentoMonto      Int?
  cortesia            Boolean         @default(false)
  medioPago           MedioPago
  estado              EstadoComanda   @default(activa)
  clienteNombre       String?
  usuarioId           Int
  usuario             Usuario         @relation(...)
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt

  @@index([fecha])
  @@index([estado])
  @@index([usuarioId])
  @@index([categoriaId])
  @@index([chica1Id])
  @@index([chica2Id])
  @@index([clienteNombre])
  @@index([chicaRecibeComisionId])
}
```

**Relaciones:**
- Comanda → Categoria (N:1)
- Comanda → Chica (N:1 via chica1)
- Comanda → Chica (N:1 via chica2)
- Comanda → Chica (N:1 via chicaRecibeComision)
- Comanda → Usuario (N:1)

**Índices:**
- `fecha` - Para filtrado por día
- `estado` - Para filtrado activo/pagado/anulado
- `clienteNombre` - Para búsqueda por cliente

---

### CajaTurno

Resumen de caja por turno.

```prisma
model CajaTurno {
  id                Int      @id @default(autoincrement())
  fecha             DateTime
  turno             String
  totalEfectivo     Int
  totalTransferencia Int
  totalDebito       Int
  totalCredito      Int
  totalGeneral      Int
  responsable       String

  @@index([fecha])
}
```

**Relaciones:**
- Ninguna (tabla standalone)

---

### AuditLog

Log de auditoría.

```prisma
model AuditLog {
  id         Int      @id @default(autoincrement())
  usuarioId  Int?
  accion     String
  tabla      String
  registroId Int?
  fecha      DateTime @default(now())
  detalles   String?
}
```

**Relaciones:**
- AuditLog → Usuario (N:1, opcional)

---

## Migraciones

### Ver migrate status

```bash
npx prisma migrate status
```

### Aplicar migraciones

```bash
npx prisma migrate deploy
```

### Reset completo (dev)

```bash
npx prisma migrate reset
```

---

## Consultas Comunes

### Comandas activas del día

```prisma
const hoy = new Date()
hoy.setHours(0, 0, 0, 0)

const comandasActivas = await prisma.comanda.findMany({
  where: {
    fecha: { gte: hoy },
    estado: 'activa'
  }
})
```

### Clientes abiertos

```prisma
const clientesAbiertos = await prisma.comanda.groupBy({
  by: ['clienteNombre'],
  where: {
    fecha: { gte: hoy },
    estado: 'activa'
  },
  _count: true
})
```

### Comisiones por chica

```prisma
const comisiones = await prisma.comanda.groupBy({
  by: ['chicaRecibeComisionId'],
  where: {
    fecha: { gte: inicioMes },
    estado: 'pagada'
  },
  _sum: {
    comisionChica1: true,
    comisionChica2: true
  }
})
```

---

*Última actualización: Abril 2026*