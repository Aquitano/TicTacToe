/*
  Warnings:

  - You are about to drop the column `board` on the `Game` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "playerID" TEXT NOT NULL,
    CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Move_playerID_fkey" FOREIGN KEY ("playerID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "winner" TEXT,
    "turn" TEXT NOT NULL DEFAULT 'X'
);
INSERT INTO "new_Game" ("createdAt", "id", "turn", "updatedAt", "winner") SELECT "createdAt", "id", "turn", "updatedAt", "winner" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
