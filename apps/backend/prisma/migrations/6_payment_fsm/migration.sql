-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('NONE', 'INITIATED', 'PAID', 'FAILED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'IN_TRANSIT';
ALTER TYPE "OrderStatus" ADD VALUE 'DELIVERY_PROOF_UPLOADED';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "payout_failure_reason" TEXT,
ADD COLUMN     "payout_initiated_at" TIMESTAMPTZ,
ADD COLUMN     "payout_paid_at" TIMESTAMPTZ,
ADD COLUMN     "payout_status" "PayoutStatus" NOT NULL DEFAULT 'NONE';

-- CreateTable
CREATE TABLE "payment_state_logs" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "from_state" VARCHAR(32) NOT NULL,
    "to_state" VARCHAR(32) NOT NULL,
    "trigger_event" VARCHAR(64) NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_state_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" UUID NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "event_id" TEXT NOT NULL,
    "type" VARCHAR(64),
    "payload" JSONB,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_accounts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "account_holder_name" VARCHAR(100) NOT NULL,
    "account_number_masked" VARCHAR(32) NOT NULL,
    "account_number_hash" TEXT NOT NULL,
    "ifsc" VARCHAR(15) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_state_logs_order_id_created_at_idx" ON "payment_state_logs"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_provider_event_id_key" ON "webhook_events"("provider", "event_id");

-- CreateIndex
CREATE UNIQUE INDEX "bank_accounts_user_id_key" ON "bank_accounts"("user_id");

-- AddForeignKey
ALTER TABLE "payment_state_logs" ADD CONSTRAINT "payment_state_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_accounts" ADD CONSTRAINT "bank_accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

