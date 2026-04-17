-- ============================================================
-- 002_seed.sql — тестовые данные
-- ============================================================

BEGIN;

-- ─── Products (matching frontend IDs 1–9) ──────────────────
INSERT INTO products (id, name, price, price_discounted, weight, images, category, stock)
VALUES
  (1, 'Органические помидоры', 350, NULL, '1 кг · свежая ферма',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg'],
   'Овощи', 50),
  (2, 'Авокадо Хасс спелое', 350, NULL, '2 шт',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg'],
   'Наборы', 30),
  (3, 'Бананы сладкие', 120, NULL, '1 кг',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg'],
   'Наборы', 100),
  (4, 'Грецкий орех очищенный', 450, NULL, '200 г',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg'],
   'Наборы', 40),
  (5, 'Брокколи свежая', 180, NULL, '1 шт · фермерская',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg'],
   'Овощи', 25),
  (6, 'Груши зелёные', 320, NULL, '1 кг · сладкие',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg'],
   'Наборы', 60),
  (7, 'Клубника садовая', 290, NULL, '500 г · свежая',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg'],
   'Наборы', 35),
  (8, 'Черника отборная', 380, NULL, '250 г',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg'],
   'Наборы', 0),
  (9, 'Миндаль жареный', 320, NULL, '150 г',
   ARRAY['https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg'],
   'Наборы', 0)
ON CONFLICT (id) DO UPDATE SET
  stock = EXCLUDED.stock;

-- Ensure serial sequence doesn't collide with manually inserted IDs
SELECT setval('products_id_seq', GREATEST((SELECT MAX(id) FROM products), 10));

-- ─── Delivery slots ─────────────────────────────────────────
INSERT INTO delivery_slots (date, time_range, districts, available)
SELECT * FROM (VALUES
  (CURRENT_DATE + 1, '09:00 — 12:00', ARRAY['Центр', 'Север']::text[],        true),
  (CURRENT_DATE + 1, '13:00 — 17:00', ARRAY['Центр', 'Юг', 'Запад']::text[],  true),
  (CURRENT_DATE + 1, '18:00 — 21:00', ARRAY['Все районы']::text[],             true),
  (CURRENT_DATE + 2, '09:00 — 12:00', ARRAY['Центр', 'Север']::text[],        true),
  (CURRENT_DATE + 2, '13:00 — 17:00', ARRAY['Восток', 'Запад']::text[],       true)
) AS v(date, time_range, districts, available)
WHERE NOT EXISTS (SELECT 1 FROM delivery_slots LIMIT 1);

-- ─── Promo codes ─────────────────────────────────────────────
INSERT INTO promo_codes (code, discount_percent, active_from, active_to)
VALUES
  ('MUSA10', 10, now(), now() + interval '30 days'),
  ('MUSA20', 20, now(), now() + interval '7 days'),
  ('EXPIRED', 5, now() - interval '10 days', now() - interval '1 day')
ON CONFLICT (code) DO NOTHING;

COMMIT;
