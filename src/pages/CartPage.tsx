import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  MoreHorizontalIcon,
  ShoppingBasket01Icon,
  MinusSignIcon,
  PlusSignIcon,
  ShoppingCart01Icon,
} from '@hugeicons/core-free-icons'
import { Product } from '../components/ProductCard'
import { slotsApi, DeliverySlot } from '../lib/api'

function formatSlotDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const slotDate = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (slotDate.getTime() === today.getTime()) return 'Сегодня'
  if (slotDate.getTime() === tomorrow.getTime()) return 'Завтра'
  return slotDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

interface CartItem {
  product: Product
  qty: number
}

interface CartPageProps {
  items: CartItem[]
  onIncrement: (id: string) => void
  onDecrement: (id: string) => void
  onCheckout?: () => void
}

const DELIVERY_FEE = 299

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function CartPage({ items, onIncrement, onDecrement, onCheckout }: CartPageProps) {
  const totalItems = items.reduce((s, i) => s + i.qty, 0)
  const subtotal   = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const total      = subtotal + DELIVERY_FEE

  // Реальный ближайший слот доставки из API
  const [nearestSlot, setNearestSlot] = useState<DeliverySlot | null>(null)
  const [slotsLoaded, setSlotsLoaded] = useState(false)
  useEffect(() => {
    let cancelled = false
    slotsApi.get()
      .then(data => {
        if (cancelled) return
        const available = data.filter(s => s.available)
        // отсортируем по дате (на бэке порядок не гарантирован)
        available.sort((a, b) => a.date.localeCompare(b.date) || a.time_range.localeCompare(b.time_range))
        setNearestSlot(available[0] ?? null)
      })
      .catch(() => { /* нет слотов — покажем placeholder */ })
      .finally(() => { if (!cancelled) setSlotsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const slotTitle = nearestSlot
    ? `${formatSlotDate(nearestSlot.date)}, ${nearestSlot.time_range}`
    : slotsLoaded ? 'Согласуем при подтверждении' : 'Загружаем расписание…'

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pb-[110px] gap-4 px-10">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={ShoppingCart01Icon} size={36} color="#9aa3ae" />
        </div>
        <h2 className="text-xl font-bold text-foreground tracking-tighter text-center">Корзина пуста</h2>
        <p className="text-[15px] text-muted-foreground text-center">Добавьте товары из каталога</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen pb-[110px]">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 pt-6 pb-4"
      >
        <div className="w-10 h-10 rounded-full bg-muted" />
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Корзина</h1>
        <motion.button
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Ещё"
        >
          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} color="#09090b" />
        </motion.button>
      </motion.div>

      <div className="px-5 flex flex-col gap-4">

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-[28px] p-5 flex flex-col gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #2f3136 100%)' }}
        >
          <div
            className="absolute w-44 h-44 rounded-full pointer-events-none"
            style={{ right: -52, top: -60, background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 72%)' }}
          />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>Готово к оформлению</p>
              <h2 className="text-2xl font-bold text-white tracking-tighter">Свежая корзина</h2>
            </div>
            <div className="w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 relative z-10" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <HugeiconsIcon icon={ShoppingBasket01Icon} size={28} color="#ffffff" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 relative z-10">
            {[
              { value: String(totalItems), label: 'Товаров' },
              { value: `${(totalItems * 0.8).toFixed(1)} кг`, label: 'Вес' },
              { value: '20 мин', label: 'Доставка' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl py-3 px-2 text-center" style={{ background: 'rgba(255,255,255,0.10)' }}>
                <p className="text-lg font-bold text-white mb-1">{s.value}</p>
                <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Items list */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[28px] p-3 bg-muted flex flex-col gap-3"
        >
          {items.map(({ product, qty }) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="bg-card rounded-[20px] p-3 flex items-center gap-3"
            >
              <div className="w-[72px] h-[72px] rounded-[20px] overflow-hidden shrink-0 bg-muted">
                <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                <p className="text-base font-bold text-foreground truncate tracking-tight">{product.title}</p>
                <p className="text-[14px] font-medium text-muted-foreground truncate">{product.weight}</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-base font-bold" style={{ color: '#2e8b57' }}>
                    {product.price * qty} ₽
                  </span>
                  <div className="flex items-center gap-2 rounded-full bg-muted px-1 py-1">
                    <motion.button
                      onClick={() => onDecrement(product.id)}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center"
                      whileTap={{ scale: 0.82 }}
                      aria-label="Уменьшить"
                    >
                      <HugeiconsIcon icon={MinusSignIcon} size={14} color="#09090b" strokeWidth={2.5} />
                    </motion.button>
                    <span className="min-w-[18px] text-center text-[14px] font-bold text-foreground">{qty}</span>
                    <motion.button
                      onClick={() => onIncrement(product.id)}
                      className="w-7 h-7 rounded-full bg-card flex items-center justify-center"
                      whileTap={{ scale: 0.82 }}
                      aria-label="Увеличить"
                    >
                      <HugeiconsIcon icon={PlusSignIcon} size={14} color="#09090b" strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Delivery slot */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full rounded-[28px] p-5 flex items-center justify-between gap-4 text-left"
          style={{ background: 'linear-gradient(135deg, #0b7a43 0%, #2e8b57 100%)' }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>Ближайший слот</p>
            <h3 className="text-[19px] font-bold text-white tracking-tighter mb-2">{slotTitle}</h3>
            <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
              {nearestSlot ? 'Доставка по выбранному адресу' : 'Слот выберете при оформлении'}
            </p>
          </div>
          <div className="shrink-0 rounded-[18px] px-4 py-2.5 text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.14)' }}>
            {nearestSlot ? 'К оформлению' : '—'}
          </div>
        </motion.button>

        {/* Summary */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="rounded-[28px] p-4 bg-muted flex flex-col gap-4"
        >
          <div>
            <h2 className="text-[22px] font-bold text-foreground tracking-tighter">Итого</h2>
            <p className="text-[15px] font-medium text-muted-foreground mt-1">Проверьте заказ перед оформлением</p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-muted-foreground">Подытог</span>
            <span className="text-[15px] font-bold text-foreground">{subtotal} ₽</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-muted-foreground">Доставка</span>
            <span className="text-[15px] font-bold text-foreground">{DELIVERY_FEE} ₽</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-muted-foreground/10">
            <span className="text-[15px] font-bold text-foreground">Итого</span>
            <span className="text-[15px] font-bold text-foreground">{total} ₽</span>
          </div>

          <motion.button
            onClick={onCheckout}
            whileTap={{ scale: 0.97 }}
            className="h-14 rounded-[20px] bg-foreground flex items-center justify-between px-5 w-full"
          >
            <span className="text-base font-bold text-white">Оформить заказ</span>
            <span className="rounded-2xl px-3 py-2.5 text-[14px] font-bold text-white leading-none" style={{ background: 'rgba(255,255,255,0.12)' }}>
              {total} ₽
            </span>
          </motion.button>
        </motion.section>
      </div>
    </div>
  )
}
