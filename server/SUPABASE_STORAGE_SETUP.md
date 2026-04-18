# Supabase Storage setup — file upload для товаров

Эндпоинт `POST /api/upload/product-image` (admin only) загружает файл в Supabase Storage и возвращает публичный URL. Перед использованием нужно один раз настроить bucket и env-переменные.

## 1. Создать bucket в Supabase Dashboard

1. Открыть проект в Supabase → **Storage** → **Create a new bucket**
2. Имя: `product-images`
3. Public bucket: **включить** (так файлы доступны по прямой ссылке без подписи)
4. File size limit: 5 MB (совпадает с серверным лимитом multer)
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`

## 2. Получить Service Role Key

Supabase Dashboard → **Project Settings → API** → раздел **Project API keys**, скопировать `service_role` ключ.

⚠ Это секрет — никогда не кладите в frontend код, только на сервер.

## 3. Добавить env-переменные на Railway

В сервисе **musa-server** добавить:

```
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...      # из шага 2
SUPABASE_BUCKET=product-images               # опционально, дефолт уже product-images
```

После добавления Railway перезапустит сервис — увидеть в логах `[upload] ...` сообщений не должно быть (warning появляется только если переменные пустые).

## 4. Проверка

1. Открыть админку → Товары → Новый товар
2. В блоке «Изображения» нажать **«Загрузить с устройства»** — выбрать JPG/PNG до 5 MB
3. URL должен появиться в списке с preview. Сохранить товар.

## Диагностика

| Проблема | Причина / фикс |
|---|---|
| `503 Storage не настроен на сервере` | SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY пусты — проверить Railway env |
| `502 Bucket not found` | Bucket `product-images` не создан или имя не совпадает с `SUPABASE_BUCKET` |
| `413 Файл слишком большой` | Файл > 5 MB; сжать или поднять лимит в `routes/upload.ts` |
| `400 Недопустимый тип файла` | Не-изображение; ALLOWED_MIME в `routes/upload.ts` |
| Загружено, но картинка не открывается | Bucket приватный — сделать его Public в Dashboard |
