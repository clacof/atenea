-- CreateEnum
CREATE TYPE "EstadoCocina" AS ENUM ('pendiente', 'listo');

-- AlterEnum
ALTER TYPE "TipoCategoria" ADD VALUE 'comida';

-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "seccion" TEXT;

-- AlterTable
ALTER TABLE "Comanda" ADD COLUMN     "cantidad" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "cocinaListoAt" TIMESTAMP(3),
ADD COLUMN     "estadoCocina" "EstadoCocina",
ADD COLUMN     "notas" TEXT;

-- CreateIndex
CREATE INDEX "Comanda_estadoCocina_idx" ON "Comanda"("estadoCocina");

