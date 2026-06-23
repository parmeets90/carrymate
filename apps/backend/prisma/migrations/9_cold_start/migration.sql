-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "delivery_requests" ADD COLUMN     "expiry_reminder_sent_at" TIMESTAMPTZ,
ADD COLUMN     "relist_count" INTEGER NOT NULL DEFAULT 0;

