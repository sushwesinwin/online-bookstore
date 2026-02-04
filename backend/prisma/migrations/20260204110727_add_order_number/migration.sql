/*
Warnings:

- A unique constraint covering the columns `[orderNumber]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
- Added the required column `orderNumber` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - Add column as nullable first
ALTER TABLE "orders" ADD COLUMN "orderNumber" TEXT;

-- Update existing orders with generated order numbers
DO $$
DECLARE
    order_record RECORD;
    new_order_number TEXT;
BEGIN
    FOR order_record IN SELECT id, "createdAt" FROM orders WHERE "orderNumber" IS NULL
    LOOP
        new_order_number := 'ORD-' || 
                           TO_CHAR(order_record."createdAt", 'YYYYMMDD') || '-' ||
                           UPPER(SUBSTRING(MD5(order_record.id::TEXT) FROM 1 FOR 6));
        UPDATE orders SET "orderNumber" = new_order_number WHERE id = order_record.id;
    END LOOP;
END $$;

-- Make the column NOT NULL after populating existing records
ALTER TABLE "orders" ALTER COLUMN "orderNumber" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders" ("orderNumber");