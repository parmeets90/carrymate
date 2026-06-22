-- CreateTable
CREATE TABLE "inspection_records" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "traveler_id" UUID NOT NULL,
    "photos" JSONB NOT NULL,
    "checklist" JSONB NOT NULL,
    "pdf_key" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inspection_records_order_id_key" ON "inspection_records"("order_id");

-- CreateIndex
CREATE INDEX "inspection_records_traveler_id_idx" ON "inspection_records"("traveler_id");

-- AddForeignKey
ALTER TABLE "inspection_records" ADD CONSTRAINT "inspection_records_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

