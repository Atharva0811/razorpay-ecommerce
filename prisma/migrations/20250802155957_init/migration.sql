/*
  Warnings:

  - You are about to drop the column `duration` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `SubscriptionPlan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" DROP COLUMN "duration",
DROP COLUMN "price";

-- DropEnum
DROP TYPE "public"."Duration";

-- CreateTable
CREATE TABLE "public"."Price" (
    "id" SERIAL NOT NULL,
    "three" INTEGER NOT NULL,
    "six" INTEGER NOT NULL,
    "twelve" INTEGER NOT NULL,
    "subscriptionPlanId" INTEGER,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_subscriptionPlanId_key" ON "public"."Price"("subscriptionPlanId");

-- AddForeignKey
ALTER TABLE "public"."Price" ADD CONSTRAINT "Price_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "public"."SubscriptionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
