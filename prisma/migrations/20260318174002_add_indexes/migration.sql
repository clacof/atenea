-- CreateIndex
CREATE INDEX "CajaTurno_fecha_idx" ON "CajaTurno"("fecha");

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
