-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Categoria" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'trago',
    "precioCliente" INTEGER,
    "precioChica" INTEGER,
    "comisionChica" INTEGER,
    "precio" INTEGER,
    "activa" BOOLEAN NOT NULL DEFAULT true
);
INSERT INTO "new_Categoria" ("activa", "comisionChica", "id", "nombre", "precioChica", "precioCliente") SELECT "activa", "comisionChica", "id", "nombre", "precioChica", "precioCliente" FROM "Categoria";
DROP TABLE "Categoria";
ALTER TABLE "new_Categoria" RENAME TO "Categoria";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
