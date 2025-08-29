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
INSERT INTO "new_Shop" ("id", "shopDomain", "scope", "installedAt", "billingPlan", "pendingPlan", "lastTotalMetric")
    SELECT "id", "shopDomain", "scope", "installedAt",
           CASE
             WHEN "billingPlan" = 'Basic' THEN 'basic'
             WHEN "billingPlan" = 'Pro' THEN 'pro'
             WHEN "billingPlan" = 'Growth' THEN 'growth'
             WHEN "billingPlan" = 'Power' THEN 'growth'
             ELSE "billingPlan"
           END,
           CASE
             WHEN "pendingPlan" = 'Basic' THEN 'basic'
             WHEN "pendingPlan" = 'Pro' THEN 'pro'
             WHEN "pendingPlan" = 'Growth' THEN 'growth'
             WHEN "pendingPlan" = 'Power' THEN 'growth'
             ELSE "pendingPlan"
           END,
           "lastTotalMetric"
    FROM "Shop";
DROP TABLE "Shop";
ALTER TABLE "new_Shop" RENAME TO "Shop";
CREATE UNIQUE INDEX "Shop_shopDomain_key" ON "Shop"("shopDomain");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
