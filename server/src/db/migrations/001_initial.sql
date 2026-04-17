-- ============================================================
-- 001_initial.sql — полная схема базы данных Musa
-- ============================================================

BEGIN;

-- ─── Users ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  telegram_id   BIGINT        PRIMARY KEY,
  username      VARCHAR(64),
  first_name    VARCHAR(128)  NOT NULL,
  last_name     VARCHAR(128),
  photo_url     TEXT,
  phone         VARCHAR(20),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- ─── Admins ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  telegram_id   BIGINT PRIMARY KEY REFERENCES users(telegram_id) ON DELETE CASCADE
);

-- ─── Addresses ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id            SERIAL        PRIMARY KEY,
  user_id       BIGINT        NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  label         VARCHAR(64)   NOT NULL DEFAULT 'Адрес',
  address       TEXT          NOT NULL,
  is_default    BOOLEAN       NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CONSTRAINT addresses_per_user CHECK (true)   -- enforced at application level (max 5)
);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON addresses(user_id);

-- ─── Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              SERIAL        PRIMARY KEY,
  name            VARCHAR(256)  NOT NULL,
  price           INTEGER       NOT NULL CHECK (price > 0),
  price_discounted INTEGER               CHECK (price_discounted > 0),
  weight          VARCHAR(64)   NOT NULL,
  images          TEXT[]        NOT NULL DEFAULT '{}',
  category        VARCHAR(64)   NOT NULL,
  origin          VARCHAR(128),
  tags            TEXT[]        NOT NULL DEFAULT '{}',
  description     TEXT,
  calories        NUMERIC(6,1),
  carbs           NUMERIC(6,1),
  fats            NUMERIC(6,1),
  ripeness        VARCHAR(64),
  stock           INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock    ON products(stock);

-- ─── Delivery slots ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_slots (
  id          SERIAL      PRIMARY KEY,
  product_id  INTEGER     REFERENCES products(id) ON DELETE SET NULL,
  date        DATE        NOT NULL,
  time_range  VARCHAR(32) NOT NULL,
  districts   TEXT[]      NOT NULL DEFAULT '{}',
  available   BOOLEAN     NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_slots_date ON delivery_slots(date);

-- ─── Promo codes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promo_codes (
  id               SERIAL      PRIMARY KEY,
  code             VARCHAR(32) NOT NULL UNIQUE,
  discount_percent INTEGER     NOT NULL CHECK (discount_percent BETWEEN 1 AND 100),
  active_from      TIMESTAMPTZ NOT NULL,
  active_to        TIMESTAMPTZ NOT NULL,
  created_by       BIGINT      REFERENCES admins(telegram_id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Orders ─────────────────────────────────────────────────
CREATE TYPE order_status AS ENUM (
  'pending', 'confirmed', 'assembling', 'delivering', 'delivered', 'cancelled'
);

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL        PRIMARY KEY,
  user_id          BIGINT        NOT NULL REFERENCES users(telegram_id) ON DELETE RESTRICT,
  status           order_status  NOT NULL DEFAULT 'pending',
  address          TEXT          NOT NULL,
  phone            VARCHAR(20)   NOT NULL,
  delivery_slot_id INTEGER       REFERENCES delivery_slots(id) ON DELETE SET NULL,
  promo_id         INTEGER       REFERENCES promo_codes(id) ON DELETE SET NULL,
  total            INTEGER       NOT NULL CHECK (total >= 0),
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_user   ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- ─── Order items ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL  PRIMARY KEY,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  price       INTEGER NOT NULL CHECK (price > 0)
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ─── Favorites ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  user_id    BIGINT  NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, product_id)
);

-- ─── Cart ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cart (
  user_id    BIGINT  NOT NULL REFERENCES users(telegram_id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  PRIMARY KEY (user_id, product_id)
);

COMMIT;
