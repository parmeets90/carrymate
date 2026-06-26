-- CreateTable
CREATE TABLE "testimonials" (
    "id" UUID NOT NULL,
    "quote" TEXT NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "role" VARCHAR(80) NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "accent" VARCHAR(16) NOT NULL DEFAULT 'gold',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founders" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "role" VARCHAR(80) NOT NULL,
    "initials" VARCHAR(4) NOT NULL,
    "accent" VARCHAR(16) NOT NULL DEFAULT 'sky',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "founders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faq_items" (
    "id" UUID NOT NULL,
    "question" VARCHAR(200) NOT NULL,
    "answer" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "brand_name" VARCHAR(60) NOT NULL DEFAULT 'CarryMate',
    "tagline" VARCHAR(200) NOT NULL DEFAULT '',
    "contact_email" VARCHAR(120) NOT NULL DEFAULT '',
    "support_email" VARCHAR(120) NOT NULL DEFAULT '',
    "contact_phone" VARCHAR(40) NOT NULL DEFAULT '',
    "twitter_url" VARCHAR(200) NOT NULL DEFAULT '',
    "instagram_url" VARCHAR(200) NOT NULL DEFAULT '',
    "linkedin_url" VARCHAR(200) NOT NULL DEFAULT '',
    "app_store_url" VARCHAR(200) NOT NULL DEFAULT '',
    "play_store_url" VARCHAR(200) NOT NULL DEFAULT '',
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "testimonials_active_sort_order_idx" ON "testimonials"("active", "sort_order");

-- CreateIndex
CREATE INDEX "founders_active_sort_order_idx" ON "founders"("active", "sort_order");

-- CreateIndex
CREATE INDEX "faq_items_active_sort_order_idx" ON "faq_items"("active", "sort_order");


-- Seed: singleton settings row
INSERT INTO "site_settings" (id, brand_name, tagline, contact_email, support_email, contact_phone, twitter_url, instagram_url, linkedin_url, app_store_url, play_store_url, updated_at)
VALUES ('singleton', 'CarryMate', 'A peer-to-peer way to send the things that matter across borders — carried by people you can trust.', 'hello@carrymate.app', 'support@carrymate.app', '', '#', '#', '#', '#', '#', now());

-- Seed: founders
INSERT INTO "founders" (id, name, role, initials, accent, sort_order, active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Aamir Wani', 'Trust & Operations', 'AW', 'gold', 0, true, now(), now()),
  (gen_random_uuid(), 'Rishav Tiwari', 'Growth & Community', 'RT', 'ember', 1, true, now(), now()),
  (gen_random_uuid(), 'Parmeet Singh', 'Product & Engineering', 'PS', 'sky', 2, true, now(), now());

-- Seed: testimonials
INSERT INTO "testimonials" (id, quote, name, role, rating, accent, sort_order, active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'My mother sends pickle and snacks every few weeks now. It actually arrives fresh, and I always know who''s carrying it. It feels like home reaching me.', 'Sana K.', 'Recipient · Dubai', 5, 'gold', 0, true, now(), now()),
  (gen_random_uuid(), 'I fly Mumbai–Dubai for work twice a month with half-empty bags. Now those trips pay for themselves, and the open-box step means I''m never carrying anything I haven''t seen.', 'Vikram R.', 'Traveler · 31 deliveries', 5, 'sky', 1, true, now(), now()),
  (gen_random_uuid(), 'Transcripts had to reach my university in four days. Courier couldn''t promise it. A verified traveler hand-carried them and I confirmed delivery with a code. Lifesaver.', 'Rohan M.', 'Sender · Pune', 5, 'mint', 2, true, now(), now());

-- Seed: FAQs
INSERT INTO "faq_items" (id, question, answer, sort_order, active, created_at, updated_at) VALUES
  (gen_random_uuid(), 'Is it safe to hand my belongings to a stranger?', 'Every traveler is identity-verified, passport-checked and on a ticket-confirmed flight. Contents are inspected in an open-box declaration before they''re carried, your payment is held in escrow until you confirm delivery, and both sides rate each other. If anything goes wrong, you can open a dispute within two taps.', 0, true, now(), now()),
  (gen_random_uuid(), 'When does the traveler actually get paid?', 'Never before delivery. Your payment sits in escrow from the moment you book. It''s released to the traveler only after the recipient confirms receipt with a one-time handover code. If delivery fails or a dispute is resolved in your favour, it''s refunded.', 1, true, now(), now()),
  (gen_random_uuid(), 'What can I send — and what''s not allowed?', 'Personal items only: food, documents, clothing, gifts and similar personal effects. For the MVP we do not allow electronics, medicines, liquids, or high-value goods. Requests are screened against a prohibited-item list the moment they''re created, not at match time.', 2, true, now(), now()),
  (gen_random_uuid(), 'How is this cheaper than a courier?', 'Travelers are already flying with spare luggage allowance, so there''s no dedicated freight cost. You pay a modest carry fee plus our service fee — typically a fraction of the ₹4,500–7,500 a courier charges for a small personal parcel.', 3, true, now(), now()),
  (gen_random_uuid(), 'Won''t the traveler get in trouble at customs?', 'That''s exactly why open-box declaration and prohibited-item screening are mandatory. Travelers always know precisely what they''re carrying and that it''s legal for the corridor. We carry personal effects only — never commercial imports or goods bought to resell.', 4, true, now(), now()),
  (gen_random_uuid(), 'Which routes are live?', 'We''re launching India → UAE first — the densest, lowest-friction corridor. Canada and the USA are later phases, opening only once trust and liquidity metrics hold on the first corridor.', 5, true, now(), now()),
  (gen_random_uuid(), 'Can I be both a sender and a traveler?', 'Yes. One verified account holds both roles — send something on one trip, carry something on the next. You can switch roles anytime in your profile.', 6, true, now(), now());
