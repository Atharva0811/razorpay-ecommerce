/*
  Warnings:

  - You are about to drop the column `description` on the `SubscriptionPlan` table. All the data in the column will be lost.
  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Price" DROP CONSTRAINT "Price_subscriptionPlanId_fkey";

-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" DROP COLUMN "description",
ADD COLUMN     "six" INTEGER,
ADD COLUMN     "three" INTEGER,
ADD COLUMN     "twelve" INTEGER;

-- DropTable
DROP TABLE "public"."Price";
