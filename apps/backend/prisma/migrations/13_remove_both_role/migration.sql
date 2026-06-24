-- Drop the BOTH user role. Existing BOTH users become SENDER — behavior-preserving,
-- since the app already rendered the sender tab set for BOTH users, and anyone can
-- switch role from their profile.

-- 1. Remap existing rows off the value we're about to remove.
UPDATE "users" SET "role" = 'SENDER' WHERE "role" = 'BOTH';

-- 2. Recreate the enum without BOTH (Postgres can't drop an enum value in place).
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('SENDER', 'TRAVELER', 'ADMIN');
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole" USING ("role"::text::"UserRole");
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'SENDER';
DROP TYPE "UserRole_old";
