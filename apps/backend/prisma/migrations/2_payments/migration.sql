-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "escrow_held_at" TIMESTAMPTZ,
ADD COLUMN     "payment_method" TEXT,
ADD COLUMN     "razorpay_order_id" TEXT,
ADD COLUMN     "razorpay_payment_id" TEXT,
ADD COLUMN     "razorpay_refund_id" TEXT,
ADD COLUMN     "refunded_at" TIMESTAMPTZ,
ADD COLUMN     "released_at" TIMESTAMPTZ;

-- CreateIndex
CREATE UNIQUE INDEX "orders_razorpay_order_id_key" ON "orders"("razorpay_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_razorpay_payment_id_key" ON "orders"("razorpay_payment_id");

