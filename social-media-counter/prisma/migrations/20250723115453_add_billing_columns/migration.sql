-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "billingPlan" TEXT NOT NULL DEFAULT 'Basic',
    "pendingPlan" TEXT,
    "lastTotalMetric" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_Shop" ("id", "shopDomain") SELECT "id", "shopDomain" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
