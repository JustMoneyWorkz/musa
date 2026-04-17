# Musa — Project Reference

Telegram WebApp для заказа фермерских продуктов.
React 18 + TypeScript + Tailwind CSS v3 + framer-motion v12 (frontend) / Node.js + Express + PostgreSQL (backend).

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS v3 |
| Animations | framer-motion v12 |
| Icons | `@hugeicons/react` + `@hugeicons/core-free-icons` v4 |
| Backend | Node.js, Express, PostgreSQL (pg pool) |
| Auth | Telegram WebApp HMAC-SHA256 (`Authorization: tma <initData>`) |
| Dev proxy | Vite `/api` → `localhost:3000` |

---

## Project structure

```
src/
  App.tsx                  — root, all overlays, hooks wiring
  lib/api.ts               — all API calls + types
  hooks/
    useCart.ts             — cart qty, optimistic updates
    useFavorites.ts        — favorite ids, optimistic updates
    useAddresses.ts        — addresses (max 5)
    useOrders.ts           — orders list, activeOrder, ordersCount
    useAdmin.ts            — isAdmin (GET /api/admin/check)
  pages/
    ProfilePage.tsx        — props: favoritesCount, ordersCount, activeOrder, isAdmin, onAdminClick
    OrdersPage.tsx         — props: orders, loading, onRefresh, onOrderClick
    OrderDetailPage.tsx    — props: order, onClose, onOrderUpdated
    CheckoutPage.tsx       — props: items, onClose, onConfirm, savedAddresses, onSaveAddress
    AddressesPage.tsx      — props: onClose, addressesHook, onShowToast
    AdminPage.tsx          — props: isAdmin, onClose — product CRUD, 403 guard
    BrowsePage, CartPage, FavoritesPage, ProductPage, PaymentPage, SupportPage
  components/
    ProductCard.tsx, BottomNav.tsx, ...

server/src/
  index.ts                 — Express app, all routes under /api + auth middleware
  middleware/
    auth.ts                — validateInitData (HMAC), requireAdmin, AuthRequest
    rateLimiter.ts
  routes/
    products.ts            — GET/, GET/:id, POST/(admin), PUT/:id(admin), DELETE/:id(admin)
    orders.ts              — GET/, GET/:id, POST/, POST/:id/confirm, PATCH/:id/status(admin)
    cart.ts, favorites.ts, users.ts, promo.ts
    admin.ts               — GET/check, GET/me, GET/orders, GET/users, POST/admins,
                             DELETE/admins/:id, POST/promo, GET/delivery-slots, POST/delivery-slots
  db/
    migrations/001_initial.sql — full schema
    migrations/002_seed.sql    — test products, slots, promos
    pool.ts
```

---

## API endpoints

All require `Authorization: tma <initData>`. Dev bypass: `hash=devbypass`.

### Products `/api/products`
- `GET /` — public, `?category=X&limit=50&offset=0`
- `GET /:id` — public
- `POST /` — admin only
- `PUT /:id` — admin only
- `DELETE /:id` — admin only

### Orders `/api/orders`
- `GET /slots` — delivery slots (public auth)
- `GET /` — user's orders (with items, slot, promo JOIN)
- `GET /:id` — single order with `promo_discount`
- `POST /` — create order (`items[], address, phone, delivery_slot_id?, promo_code?`)
- `POST /:id/confirm` — user confirms receipt (delivering → delivered)
- `PATCH /:id/status` — admin changes any status

### Admin `/api/admin`
- `GET /check` or `GET /me` → `{ is_admin: boolean }`
- `GET /orders?status=X` — all orders (requireAdmin), includes user info + slot + promo
- `PATCH /orders/:id/status` — change order status (requireAdmin), body: `{ status }`
- All other admin routes require `requireAdmin` middleware

### Cart, Favorites, Addresses, Promo — standard CRUD, see `src/lib/api.ts`

---

## Database schema (key tables)

```sql
users(telegram_id PK, username, first_name, last_name, photo_url, phone)
admins(telegram_id PK FK→users)
products(id, name, price, price_discounted, weight, images[], category, origin,
         tags[], description, calories, carbs, fats, ripeness, stock)
delivery_slots(id, product_id, date, time_range, districts[], available)
promo_codes(id, code UNIQUE, discount_percent, active_from, active_to, created_by)
orders(id, user_id, status ENUM, address, phone, delivery_slot_id, promo_id, total)
order_items(id, order_id, product_id, quantity, price)
favorites(user_id, product_id PK)
cart(user_id, product_id PK, quantity)
addresses(id, user_id, label, address, is_default) -- max 5 enforced in app
```

Order statuses: `pending → confirmed → assembling → delivering → delivered | cancelled`

---

## Frontend patterns

### Overlays
All pages open as full-screen overlays via `AnimatePresence` + `motion.div` with `overlayVariants` (`y: 100% → 0`). Z-index layers:
- `90` — product, favorites, profile sections, checkout
- `95` — order detail
- `100` — admin panel
- `200` — global toast, delete confirm
- `210` — product form sheet (inside AdminPage)

### Hooks at App level — passed as props down to pages
```ts
useCart()      → cartQty, cartCount, addToCart, decrement, clearCart
useFavorites() → favoriteIds, favoritesCount, toggleFavorite, refreshFavorites
useAddresses() → addresses, loading, canAdd, addAddress, removeAddress, setDefault
useOrders()    → orders, loading, activeOrder, ordersCount, refreshOrders
useAdmin()     → isAdmin, loading
```

### Status colors (orders)
```ts
pending:    grey   #a1a1aa / rgba(161,161,170,0.12)
confirmed, assembling, delivering: green #2e8b57 / rgba(46,139,87,0.10)
delivered:  blue   #3b82f6 / rgba(59,130,246,0.10)
cancelled:  orange #f59e0b / rgba(245,158,11,0.10)
```
Exported from `OrdersPage.tsx` as `STATUS_LABEL, STATUS_COLOR, STATUS_BG`.

### Design tokens
- Background: `bg-background`, cards: `bg-muted` / `bg-card`
- Primary accent: `#09090b` (почти чёрный), green: `#2e8b57`
- Rounded corners: `rounded-[20px]` cards, `rounded-[16px]` rows, `rounded-[24px]` hero
- Hero gradients: `linear-gradient(135deg, #09090b 0%, #27272a 100%)`
- `tracking-tighter` на всех заголовках

### Icons
Library: `@hugeicons/core-free-icons` (free tier). Usage:
```tsx
import { SomeIcon } from '@hugeicons/core-free-icons'
<HugeiconsIcon icon={SomeIcon} size={20} color="#09090b" />
```
**Проверять иконки перед использованием:** grep по `node_modules/@hugeicons/core-free-icons/dist/cjs/index.js`
Не существуют: `Reload01Icon`, `Tag01Icon`, `TickDouble01Icon`

---

## Type-checking (без full tsc)

```js
node -e "
const ts = require('typescript'), fs = require('fs')
const src = fs.readFileSync('src/pages/SomePage.tsx','utf8')
const r = ts.transpileModule(src, { compilerOptions: { target: 99, jsx: 2 }, reportDiagnostics: true })
r.diagnostics?.forEach(d => console.log(ts.flattenDiagnosticMessageText(d.messageText,'\n')))
"
```

---

## Dev notes

- `PRODUCTS` массив в `App.tsx` — статические демо-данные (пока каталог не переведён на API)
- `CheckoutPage` считает `total` из `items[].product.price * qty` (не из цены со скидкой — TODO)
- `addresses` таблица называется `addresses` но в `api.ts` используется `/api/users/me/addresses`
- Seed промокоды: `MUSA10` (10%), `MUSA20` (20%), `EXPIRED` (истёкший)
- Dev auth bypass: `hash=devbypass` + `NODE_ENV=development` в сервере

---

## Completed prompts

- **ПРОМПТ 2** — Favorites API, Addresses API, ProfilePage props
- **ПРОМПТ 3** — CheckoutPage (полный), useOrders, POST /orders, success screen
- **ПРОМПТ 4** — OrdersPage, OrderDetailPage, POST /orders/:id/confirm
- **ПРОМПТ 5** — AdminPage (product CRUD), useAdmin, crown button, /admin/check
- **ПРОМПТ 6** — AdminPage tabs (Товары/Заказы), orders list + detail, status change, contact button via tg.openTelegramLink
- **ПРОМПТ 7** — AdminPage 3rd tab "Промо": promo list + create form + delete confirm; CheckoutPage toast fix
- **ПРОМПТ 8** — Home page: logo.svg + "СВОЙнабор" TextRoll animation (barrel-roll per char, delay 0.55s+stagger), BlurFade logo; ProfilePage AnimatedNumber counters (0→real value); reviews block with StarIcon (5.0 / 5 stars / "25+ довольных клиентов"); AdminPage User01Icon→User02Icon fix
- **ПРОМПТ 9** — ProfilePage "Сохранено" → реальный addresses.length (проп addressesCount); SupportPage кнопка → toast "Функция в разработке"; BrowsePage "Зелёный район" → "Мурманск"; CheckoutPage "Переводом" toast был готов с ПРОМПТ 7
- **ПРОМПТ 10** — Аудит: CartPage убрал захардкоженный PROMO_DISCOUNT (−150 ₽ всегда показывался); App.tsx "Начать" кнопка → navigate('catalog'); server/routes/admin.ts удалён дублирующий POST /admin/promo
- **ПРОМПТ 12** — Backend audit: фикс race condition в POST /orders — `SELECT ... ORDER BY id FOR UPDATE` (lock + защита от deadlock) + conditional UPDATE `WHERE stock >= $1` с проверкой rowCount → 409. Остальное чисто (HMAC, isolation, max-5, idempotent favorites, indexes, FK).
- **ПРОМПТ 13** — Финальный аудит: AdminPage 📦 emoji → Package01Icon; App.tsx handleNavigate — scroll reset (`window.scrollTo(0,0)`) + guard на повторный клик активного таба; server/products.ts DELETE — обработка FK 23503 → 409 "есть заказы с этим товаром"; CheckoutPage handleSubmit — guard на пустую корзину.
- **ПРОМПТ 11** — Ручной прогон страниц: добавлена кнопка «Поддержка» (CustomerService01Icon) в top bar главной → `tg.openTelegramLink('https://t.me/musa_support')`; BrowsePage кнопка «Все» напротив «Популярное» получила onClick → `setActiveCategory(0)` (сброс фильтра).
