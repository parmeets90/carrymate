-- CreateEnum
CREATE TYPE "ScanRuleKind" AS ENUM ('PROHIBITED', 'ALLOWED');

-- CreateTable
CREATE TABLE "scan_rules" (
    "id" UUID NOT NULL,
    "label" VARCHAR(60) NOT NULL,
    "kind" "ScanRuleKind" NOT NULL DEFAULT 'PROHIBITED',
    "category" VARCHAR(40),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "scan_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scan_rules_active_idx" ON "scan_rules"("active");


-- Seed the default Smart Scan prohibited rules (the formerly hard-coded list).
INSERT INTO "scan_rules" ("id","label","kind","category","active","created_at","updated_at") VALUES
(gen_random_uuid(),'mobile phone','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'telephone','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'smartphone','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'tablet computer','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'laptop','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'computer','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'camera','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'television','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'headphones','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'gadget','PROHIBITED','electronics',true,now(),now()),
(gen_random_uuid(),'bottle','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'perfume','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'liquor','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'wine','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'beer','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'cocktail','PROHIBITED','liquids',true,now(),now()),
(gen_random_uuid(),'jewellery','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'jewelry','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'gold','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'coin','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'cash','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'watch','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'ring','PROHIBITED','valuables',true,now(),now()),
(gen_random_uuid(),'knife','PROHIBITED','weapons',true,now(),now()),
(gen_random_uuid(),'gun','PROHIBITED','weapons',true,now(),now()),
(gen_random_uuid(),'weapon','PROHIBITED','weapons',true,now(),now()),
(gen_random_uuid(),'sword','PROHIBITED','weapons',true,now(),now()),
(gen_random_uuid(),'dagger','PROHIBITED','weapons',true,now(),now()),
(gen_random_uuid(),'pill','PROHIBITED','medicine',true,now(),now()),
(gen_random_uuid(),'medicine','PROHIBITED','medicine',true,now(),now()),
(gen_random_uuid(),'capsule','PROHIBITED','medicine',true,now(),now()),
(gen_random_uuid(),'syringe','PROHIBITED','medicine',true,now(),now());
