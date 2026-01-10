-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'DECLINED', 'SHIPPED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");
