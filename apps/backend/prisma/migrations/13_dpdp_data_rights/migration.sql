-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AuditAction" ADD VALUE 'ACCOUNT_DELETED';
ALTER TYPE "AuditAction" ADD VALUE 'DATA_EXPORTED';
ALTER TYPE "AuditAction" ADD VALUE 'KYC_DOCS_PURGED';

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "consent_version" VARCHAR(20),
ADD COLUMN     "consented_at" TIMESTAMPTZ,
ADD COLUMN     "deleted_at" TIMESTAMPTZ;

