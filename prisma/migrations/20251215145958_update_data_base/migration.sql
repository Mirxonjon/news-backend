/*
  Warnings:

  - You are about to alter the column `expectedMin` on the `NewsAnalysis` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `expectedMax` on the `NewsAnalysis` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "News" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "NewsAnalysis" ADD COLUMN     "status" SMALLINT NOT NULL DEFAULT 1,
ALTER COLUMN "expectedMin" SET DATA TYPE INTEGER,
ALTER COLUMN "expectedMax" SET DATA TYPE INTEGER;
