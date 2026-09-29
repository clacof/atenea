-- AlterTable
ALTER TABLE "Chica" ADD COLUMN     "alias" TEXT,
ADD COLUMN     "archivada" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notas" TEXT,
ADD COLUMN     "telefono" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_fecha_idx" ON "AuditLog"("fecha");

-- CreateIndex
CREATE INDEX "AuditLog_tabla_idx" ON "AuditLog"("tabla");

-- CreateIndex
CREATE INDEX "AuditLog_usuarioId_idx" ON "AuditLog"("usuarioId");
