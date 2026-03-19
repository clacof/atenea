-- AlterTable
ALTER TABLE "Comanda" ADD COLUMN "clienteNombre" TEXT;

-- CreateIndex
CREATE INDEX "Comanda_clienteNombre_idx" ON "Comanda"("clienteNombre");
