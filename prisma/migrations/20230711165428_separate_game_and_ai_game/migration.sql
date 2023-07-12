/*
  Warnings:

  - You are about to drop the column `playerID` on the `Move` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Game` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "AiGame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameEnd" DATETIME,
    "winner" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AiGame_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Move" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER NOT NULL,
    "gameId" TEXT,
    "aiGameId" TEXT,
    "playerId" TEXT,
    "playerType" TEXT DEFAULT 'human',
    CONSTRAINT "Move_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Move_aiGameId_fkey" FOREIGN KEY ("aiGameId") REFERENCES "AiGame" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Move_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Move" ("createdAt", "gameId", "id", "position") SELECT "createdAt", "gameId", "id", "position" FROM "Move";
DROP TABLE "Move";
ALTER TABLE "new_Move" RENAME TO "Move";
CREATE TABLE "new_Game" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "gameEnd" DATETIME,
    "winner" TEXT,
    "turn" TEXT
);
INSERT INTO "new_Game" ("createdAt", "gameEnd", "id", "turn", "updatedAt", "winner") SELECT "createdAt", "gameEnd", "id", "turn", "updatedAt", "winner" FROM "Game";
DROP TABLE "Game";
ALTER TABLE "new_Game" RENAME TO "Game";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "AiGame_userId_key" ON "AiGame"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_gameId_key" ON "User"("gameId");
