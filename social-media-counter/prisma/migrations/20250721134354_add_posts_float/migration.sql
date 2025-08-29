/*
  Warnings:

  - You are about to alter the column `followers` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `likes` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.
  - You are about to alter the column `views` on the `SocialAccount` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SocialAccount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "profileName" TEXT NOT NULL,
    "followers" REAL NOT NULL DEFAULT 0,
    "likes" REAL NOT NULL DEFAULT 0,
    "views" REAL NOT NULL DEFAULT 0,
    "posts" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SocialAccount_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SocialAccount_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SocialAccount" ("createdAt", "followers", "id", "isActive", "likes", "platformId", "profileName", "shopId", "updatedAt", "views") SELECT "createdAt", "followers", "id", "isActive", "likes", "platformId", "profileName", "shopId", "updatedAt", "views" FROM "SocialAccount";
DROP TABLE "SocialAccount";
ALTER TABLE "new_SocialAccount" RENAME TO "SocialAccount";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
