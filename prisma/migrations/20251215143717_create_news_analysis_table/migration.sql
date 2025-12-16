/*
  Warnings:

  - You are about to drop the column `time` on the `News` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "News" DROP COLUMN "time",
ADD COLUMN     "newsTime" TIMESTAMP(3),
ALTER COLUMN "source" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "content" DROP NOT NULL,
ALTER COLUMN "uniqueKey" DROP NOT NULL;

-- CreateTable
CREATE TABLE "NewsAnalysis" (
    "id" SERIAL NOT NULL,
    "newsId" INTEGER NOT NULL,
    "ticker" TEXT NOT NULL,
    "sentiment" TEXT NOT NULL,
    "confidence" INTEGER NOT NULL,
    "impactType" TEXT NOT NULL,
    "impactStrength" INTEGER NOT NULL,
    "expectedMin" DOUBLE PRECISION NOT NULL,
    "expectedMax" DOUBLE PRECISION NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NewsAnalysis_ticker_idx" ON "NewsAnalysis"("ticker");

-- CreateIndex
CREATE INDEX "News_newsTime_idx" ON "News"("newsTime");

-- AddForeignKey
ALTER TABLE "NewsAnalysis" ADD CONSTRAINT "NewsAnalysis_newsId_fkey" FOREIGN KEY ("newsId") REFERENCES "News"("id") ON DELETE CASCADE ON UPDATE CASCADE;
