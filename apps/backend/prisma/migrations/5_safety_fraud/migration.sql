-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('KYC_APPROVED', 'KYC_REJECTED', 'KYC_DUPLICATE_FLAGGED', 'DISPUTE_RESOLVED', 'ORDER_REFUNDED', 'ORDER_FRAUD_HOLD', 'ORDER_HOLD_CLEARED', 'USER_STATUS_CHANGED', 'USER_AUTO_SUSPENDED');

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "fraud_cleared_at" TIMESTAMPTZ,
ADD COLUMN     "fraud_cleared_by_id" UUID,
ADD COLUMN     "fraud_hold" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "risk_factors" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "risk_score" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" VARCHAR(40) NOT NULL,
    "entity_id" UUID,
    "meta" JSONB,
    "ip" VARCHAR(64),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

