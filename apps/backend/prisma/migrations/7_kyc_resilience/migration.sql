-- AlterEnum
ALTER TYPE "KycStatus" ADD VALUE 'VERIFYING';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "kyc_failure_reason" TEXT,
ADD COLUMN     "kyc_submitted_at" TIMESTAMPTZ,
ADD COLUMN     "selfie_attempt_count" INTEGER NOT NULL DEFAULT 0;

