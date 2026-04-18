-- 003_payment_and_delivery_fee.sql
-- Добавляет способ оплаты и стоимость доставки в orders.
-- Фиксит расхождение: до этой миграции frontend показывал
-- total = subtotal + 299 - discount, а backend сохранял
-- total = subtotal × (1 - discount/100) — без доставки.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'cash'
    CHECK (payment_method IN ('cash', 'transfer'));

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS delivery_fee INTEGER NOT NULL DEFAULT 0
    CHECK (delivery_fee >= 0);
