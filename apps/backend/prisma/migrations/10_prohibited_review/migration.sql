-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'PENDING_REVIEW';

-- AlterTable
ALTER TABLE "delivery_requests" ADD COLUMN     "declaration_accepted_at" TIMESTAMPTZ,
ADD COLUMN     "declaration_ip" VARCHAR(64);

