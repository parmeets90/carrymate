-- AlterTable
ALTER TABLE "users" ADD COLUMN     "firebase_uid" TEXT,
ALTER COLUMN "phone" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_firebase_uid_key" ON "users"("firebase_uid");

