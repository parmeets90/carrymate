-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SENDER', 'TRAVELER', 'BOTH', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED');

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'IN_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "KycDocType" AS ENUM ('AADHAAR', 'PAN', 'PASSPORT', 'SELFIE', 'FLIGHT_TICKET');

-- CreateEnum
CREATE TYPE "KycDocStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestCategory" AS ENUM ('FOOD', 'DOCUMENTS', 'CLOTHING', 'GIFTS', 'OTHER');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'BIDDING', 'MATCHED', 'IN_TRANSIT', 'DELIVERED', 'CONFIRMED', 'DISPUTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RouteStatus" AS ENUM ('ACTIVE', 'FULL', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PickupPreference" AS ENUM ('AIRPORT', 'DOORSTEP', 'MEETUP');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'ESCROW_HELD', 'PAYOUT_INITIATED', 'COMPLETED', 'REFUNDED', 'DISPUTED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(255),
    "full_name" VARCHAR(100),
    "role" "UserRole" NOT NULL DEFAULT 'SENDER',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "kyc_status" "KycStatus" NOT NULL DEFAULT 'PENDING',
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "language" VARCHAR(5) NOT NULL DEFAULT 'en',
    "rating_avg" DECIMAL(3,2) NOT NULL DEFAULT 5.0,
    "rating_count" INTEGER NOT NULL DEFAULT 0,
    "fcm_token" TEXT,
    "last_active_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_otps" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "code_hash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "consumed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kyc_documents" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "doc_type" "KycDocType" NOT NULL,
    "doc_number_masked" VARCHAR(32),
    "doc_number_hash" TEXT,
    "file_key" TEXT,
    "status" "KycDocStatus" NOT NULL DEFAULT 'PENDING',
    "reject_reason" TEXT,
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "provider" TEXT,
    "provider_ref" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "kyc_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_routes" (
    "id" UUID NOT NULL,
    "traveler_id" UUID NOT NULL,
    "flight_number" VARCHAR(10),
    "airline" VARCHAR(50),
    "origin_airport" VARCHAR(3) NOT NULL,
    "destination_airport" VARCHAR(3) NOT NULL,
    "departure_date" DATE NOT NULL,
    "arrival_date" DATE,
    "capacity_kg" DECIMAL(4,1) NOT NULL,
    "capacity_used_kg" DECIMAL(4,1) NOT NULL DEFAULT 0,
    "ticket_file_key" TEXT,
    "ticket_verified" BOOLEAN NOT NULL DEFAULT false,
    "delivery_area" VARCHAR(100),
    "notes" TEXT,
    "status" "RouteStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "travel_routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_requests" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" TEXT NOT NULL,
    "category" "RequestCategory" NOT NULL,
    "weight_kg" DECIMAL(4,1) NOT NULL,
    "declared_value_inr" INTEGER NOT NULL,
    "item_photos" TEXT[],
    "origin_city" VARCHAR(50) NOT NULL,
    "origin_airport" VARCHAR(3) NOT NULL,
    "destination_country" VARCHAR(3) NOT NULL DEFAULT 'UAE',
    "destination_city" VARCHAR(50) NOT NULL,
    "recipient_name" VARCHAR(100) NOT NULL,
    "recipient_phone" VARCHAR(15) NOT NULL,
    "recipient_address" TEXT NOT NULL,
    "deadline_date" DATE NOT NULL,
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "sender_notes" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'OPEN',
    "matched_traveler_id" UUID,
    "accepted_bid_id" UUID,
    "prohibited_check_passed" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "delivery_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "traveler_id" UUID NOT NULL,
    "route_id" UUID NOT NULL,
    "carry_fee_inr" INTEGER NOT NULL,
    "commission_inr" INTEGER NOT NULL,
    "payout_inr" INTEGER NOT NULL,
    "message" TEXT,
    "pickup_preference" "PickupPreference" NOT NULL,
    "pickup_location" TEXT,
    "estimated_delivery_date" DATE NOT NULL,
    "status" "BidStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "bid_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "traveler_id" UUID NOT NULL,
    "amount_inr" INTEGER NOT NULL,
    "commission_inr" INTEGER NOT NULL,
    "payout_inr" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_kyc_status_idx" ON "users"("kyc_status");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "phone_otps_phone_created_at_idx" ON "phone_otps"("phone", "created_at");

-- CreateIndex
CREATE INDEX "kyc_documents_user_id_idx" ON "kyc_documents"("user_id");

-- CreateIndex
CREATE INDEX "kyc_documents_status_idx" ON "kyc_documents"("status");

-- CreateIndex
CREATE UNIQUE INDEX "kyc_documents_user_id_doc_type_key" ON "kyc_documents"("user_id", "doc_type");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "travel_routes_traveler_id_idx" ON "travel_routes"("traveler_id");

-- CreateIndex
CREATE INDEX "travel_routes_destination_airport_departure_date_status_idx" ON "travel_routes"("destination_airport", "departure_date", "status");

-- CreateIndex
CREATE INDEX "delivery_requests_sender_id_idx" ON "delivery_requests"("sender_id");

-- CreateIndex
CREATE INDEX "delivery_requests_status_idx" ON "delivery_requests"("status");

-- CreateIndex
CREATE INDEX "delivery_requests_destination_city_deadline_date_status_idx" ON "delivery_requests"("destination_city", "deadline_date", "status");

-- CreateIndex
CREATE INDEX "bids_request_id_idx" ON "bids"("request_id");

-- CreateIndex
CREATE INDEX "bids_traveler_id_idx" ON "bids"("traveler_id");

-- CreateIndex
CREATE INDEX "bids_status_idx" ON "bids"("status");

-- CreateIndex
CREATE UNIQUE INDEX "bids_request_id_traveler_id_key" ON "bids"("request_id", "traveler_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_request_id_key" ON "orders"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_bid_id_key" ON "orders"("bid_id");

-- CreateIndex
CREATE INDEX "orders_sender_id_idx" ON "orders"("sender_id");

-- CreateIndex
CREATE INDEX "orders_traveler_id_idx" ON "orders"("traveler_id");

-- AddForeignKey
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_routes" ADD CONSTRAINT "travel_routes_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_requests" ADD CONSTRAINT "delivery_requests_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "delivery_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_route_id_fkey" FOREIGN KEY ("route_id") REFERENCES "travel_routes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "delivery_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_traveler_id_fkey" FOREIGN KEY ("traveler_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

