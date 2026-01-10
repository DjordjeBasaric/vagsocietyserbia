-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('APPAREL', 'ACCESSORIES', 'STICKERS');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "category" "ProductCategory" NOT NULL DEFAULT 'APPAREL';
