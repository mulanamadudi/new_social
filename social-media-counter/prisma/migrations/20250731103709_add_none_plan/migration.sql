-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Shop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopDomain" TEXT NOT NULL,
    "scope" TEXT,
    "installedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "billingPlan" TEXT NOT NULL DEFAULT 'None',
    "pendingPlan" TEXT,
    "lastTotalMetric" REAL NOT NULL DEFAULT 0
);
INSERT INTO "new_Shop" ("billingPlan", "id", "installedAt", "lastTotalMetric", "pendingPlan", "scope", "shopDomain") SELECT "billingPlan", "id", "installedAt", "lastTotalMetric", "pendingPlan", "scope", "shopDomain" FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
