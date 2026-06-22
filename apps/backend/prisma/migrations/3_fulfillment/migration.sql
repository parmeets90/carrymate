-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('ITEM_NOT_DELIVERED', 'ITEM_DAMAGED', 'WRONG_ITEM', 'FRAUD', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'RESOLVED_SENDER', 'RESOLVED_TRAVELER');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "auto_confirm_at" TIMESTAMPTZ,
ADD COLUMN     "delivered_at" TIMESTAMPTZ,
ADD COLUMN     "delivery_otp_hash" TEXT,
ADD COLUMN     "delivery_proof" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "open_box" JSONB,
ADD COLUMN     "open_box_at" TIMESTAMPTZ,
ADD COLUMN     "picked_up_at" TIMESTAMPTZ;

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "raised_by_id" UUID NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_by_id" UUID,
    "resolution_note" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "rater_id" UUID NOT NULL,
    "ratee_id" UUID NOT NULL,
    "stars" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "disputes_status_idx" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "ratings_ratee_id_idx" ON "ratings"("ratee_id");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_order_id_rater_id_key" ON "ratings"("order_id", "rater_id");

-- CreateIndex
CREATE INDEX "orders_status_auto_confirm_at_idx" ON "orders"("status", "auto_confirm_at");

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

