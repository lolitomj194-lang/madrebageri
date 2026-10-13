-- AlterEnum
ALTER TYPE "ComboPricing" ADD VALUE 'SCALABLE';

-- AlterTable
ALTER TABLE "Combo" ADD COLUMN     "extraPersonPrice" INTEGER;

-- AlterTable
ALTER TABLE "ComboItem" ADD COLUMN     "inGrams" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "perExtraPerson" DOUBLE PRECISION NOT NULL DEFAULT 0;
