-- AlterTable
ALTER TABLE "Comanda" ADD COLUMN     "chicaRecibeComisionId" INTEGER;

-- CreateIndex
CREATE INDEX "Comanda_chicaRecibeComisionId_idx" ON "Comanda"("chicaRecibeComisionId");

-- AddForeignKey
ALTER TABLE "Comanda" ADD CONSTRAINT "Comanda_chicaRecibeComisionId_fkey" FOREIGN KEY ("chicaRecibeComisionId") REFERENCES "Chica"("id") ON DELETE SET NULL ON UPDATE CASCADE;
