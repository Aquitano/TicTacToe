/*
  Warnings:

  - You are about to drop the `Example` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Game" ADD COLUMN "gameEnd" DATETIME;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Example";
PRAGMA foreign_keys=on;
