-- AlterTable
ALTER TABLE "Categoria" ADD COLUMN     "recargoCreditoChica" INTEGER,
ADD COLUMN     "recargoCreditoCliente" INTEGER,
ADD COLUMN     "soloTransferencia" BOOLEAN NOT NULL DEFAULT false;
