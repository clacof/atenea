-- CreateTable
CREATE TABLE "ConfigGeneral" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "precioCliente" INTEGER NOT NULL,
    "precioChica" INTEGER NOT NULL,
    "comisionChica" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" DATETIME
);

-- CreateTable
CREATE TABLE "Chica" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaIngreso" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "tipoConsumo" TEXT NOT NULL,
    "chica1Id" INTEGER,
    "chica2Id" INTEGER,
    "precioBase" INTEGER NOT NULL,
    "precioFinal" INTEGER NOT NULL,
    "comisionTotal" INTEGER NOT NULL,
    "comisionChica1" INTEGER,
    "comisionChica2" INTEGER,
    "descuentoPorcentaje" REAL,
    "descuentoMonto" INTEGER,
    "cortesia" BOOLEAN NOT NULL DEFAULT false,
    "medioPago" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'activa',
    "usuarioId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comanda_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Comanda_chica1Id_fkey" FOREIGN KEY ("chica1Id") REFERENCES "Chica" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comanda_chica2Id_fkey" FOREIGN KEY ("chica2Id") REFERENCES "Chica" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Comanda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CajaTurno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL,
    "turno" TEXT NOT NULL,
    "totalEfectivo" INTEGER NOT NULL,
    "totalTransferencia" INTEGER NOT NULL,
    "totalDebito" INTEGER NOT NULL,
    "totalCredito" INTEGER NOT NULL,
    "totalGeneral" INTEGER NOT NULL,
    "responsable" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "usuarioId" INTEGER,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" INTEGER,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigGeneral_clave_key" ON "ConfigGeneral"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");
