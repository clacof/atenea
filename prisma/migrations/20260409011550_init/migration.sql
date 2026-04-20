-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('admin', 'caja', 'supervisor');

-- CreateEnum
CREATE TYPE "TipoConsumo" AS ENUM ('cliente', 'chica');

-- CreateEnum
CREATE TYPE "MedioPago" AS ENUM ('efectivo', 'transferencia', 'debito', 'credito');

-- CreateEnum
CREATE TYPE "TipoCategoria" AS ENUM ('trago', 'botella');

-- CreateEnum
CREATE TYPE "EstadoComanda" AS ENUM ('activa', 'pagada', 'anulada');

-- CreateTable
CREATE TABLE "ConfigGeneral" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,

    CONSTRAINT "ConfigGeneral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categoria" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoCategoria" NOT NULL DEFAULT 'trago',
    "isAfterhour" BOOLEAN NOT NULL DEFAULT false,
    "precioCliente" INTEGER,
    "precioChica" INTEGER,
    "comisionChica" INTEGER,
    "precio" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLogin" TIMESTAMP(3),

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chica" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chica_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comanda" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hora" TEXT NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "tipoConsumo" "TipoConsumo" NOT NULL,
    "chica1Id" INTEGER,
    "chica2Id" INTEGER,
    "precioBase" INTEGER NOT NULL,
    "precioFinal" INTEGER NOT NULL,
    "comisionTotal" INTEGER NOT NULL,
    "comisionChica1" INTEGER,
    "comisionChica2" INTEGER,
    "descuentoPorcentaje" DOUBLE PRECISION,
    "descuentoMonto" INTEGER,
    "cortesia" BOOLEAN NOT NULL DEFAULT false,
    "medioPago" "MedioPago" NOT NULL,
    "estado" "EstadoComanda" NOT NULL DEFAULT 'activa',
    "clienteNombre" TEXT,
    "usuarioId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comanda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CajaTurno" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "turno" TEXT NOT NULL,
    "totalEfectivo" INTEGER NOT NULL,
    "totalTransferencia" INTEGER NOT NULL,
    "totalDebito" INTEGER NOT NULL,
    "totalCredito" INTEGER NOT NULL,
    "totalGeneral" INTEGER NOT NULL,
    "responsable" TEXT NOT NULL,

    CONSTRAINT "CajaTurno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER,
    "accion" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" INTEGER,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalles" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ConfigGeneral_clave_key" ON "ConfigGeneral"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Comanda_fecha_idx" ON "Comanda"("fecha");

-- CreateIndex
CREATE INDEX "Comanda_estado_idx" ON "Comanda"("estado");

-- CreateIndex
CREATE INDEX "Comanda_usuarioId_idx" ON "Comanda"("usuarioId");

-- CreateIndex
CREATE INDEX "Comanda_categoriaId_idx" ON "Comanda"("categoriaId");

-- CreateIndex
CREATE INDEX "Comanda_chica1Id_idx" ON "Comanda"("chica1Id");

-- CreateIndex
CREATE INDEX "Comanda_chica2Id_idx" ON "Comanda"("chica2Id");

-- CreateIndex
CREATE INDEX "Comanda_clienteNombre_idx" ON "Comanda"("clienteNombre");

-- CreateIndex
CREATE INDEX "CajaTurno_fecha_idx" ON "CajaTurno"("fecha");

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_chica1Id_fkey" FOREIGN KEY ("chica1Id") REFERENCES "Chica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_chica2Id_fkey" FOREIGN KEY ("chica2Id") REFERENCES "Chica"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
