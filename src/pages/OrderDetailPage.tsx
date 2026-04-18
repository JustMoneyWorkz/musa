import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  DeliveryBox01Icon,
  Location01Icon,
  SmartPhone01Icon,
  Clock01Icon,
  Cash01Icon,
  DiscountTag01Icon,
  Tick01Icon,
  Package01Icon,
} from '@hugeicons/core-free-icons'
import { Order, ordersApi, ApiError } from '../lib/api'
import { STATUS_LABEL, STATUS_COLOR, STATUS_BG, formatOrderDate } from './OrdersPage'

interface OrderDetailPageProps {
  order: Order
  onClose: () => void
  onOrderUpdated: (updated: Order) => void
}

function formatSlotDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Сегодня'
  if (date.getTime() === tomorrow.getTime()) return 'Завтра'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.28, delay: i * 0.06, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

export default function OrderDetailPage({ order: initialOrder, onClose, onOrderUpdated }: OrderDetailPageProps) {
  const [order, setOrder] = useState(initialOrder)
  const [confirming, setConfirming] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  // Refetch актуальное состояние заказа при открытии детали — статус мог измениться
  // на стороне админа пока пользователь был в другом месте приложения.
  useEffect(() => {
    let cancelled = false
    ordersApi.getById(initialOrder.id)
      .then(fresh => {
        if (cancelled) return
        setOrder(fresh)
        if (fresh.status !== initialOrder.status) {
          onOrderUpdated(fresh)
        }
      })
      .catch(() => { /* молча — покажем last known state */ })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrder.id])

  const handleConfirm = async () => {
    if (confirming) return
    setConfirming(true)
    try {
      const updated = await ordersApi.confirm(order.id)
      setOrder(prev => ({ ...prev, status: updated.status }))
      onOrderUpdated({ ...order, status: updated.status })
      showToast('Получение подтверждено!')
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Ошибка подтверждения'
      showToast(msg)
    } finally {
      setConfirming(false)
    }
  }

  const isActive = order.status === 'delivering'
  const isCompleted = order.status === 'delivered'

  return (
    <div className="flex flex-col min-h-screen bg-background pb-[110px]">

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 pt-6 pb-4"
      >
        <motion.button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Назад"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#09090b" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Заказ #{order.id}</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-4">

        {/* ── Status hero ── */}
        <motion.div
          custom={0} variants={sectionVariants} initial="hidden" animate="visible"
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' }}
        >
          <div
            className="absolute w-40 h-40 rounded-full pointer-events-none"
            style={{ right: -50, top: -50, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 72%)' }}
          />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
                   style={{ background: 'rgba(255,255,255,0.10)' }}>
                <HugeiconsIcon icon={DeliveryBox01Icon} size={24} color="#ffffff" />
              </div>
              <div>
                <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  {formatOrderDate(order.created_at)}
                </p>
                <p className="text-[20px] font-bold text-white tracking-tighter">{order.total} ₽</p>
              </div>
            </div>
            <span
              className="text-[12px] font-bold px-3 py-1.5 rounded-full"
              style={{ background: STATUS_BG[order.status], color: STATUS_COLOR[order.status] }}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>
        </motion.div>

        {/* ── Items ── */}
        <motion.section
          custom={1} variants={sectionVariants} initial="hidden" animate="visible"
          className="rounded-[24px] p-5 bg-muted flex flex-col gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Package01Icon} size={18} color="#2e8b57" />
            </div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Состав заказа</h2>
          </div>
          <div className="flex flex-col gap-2">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-card rounded-[16px] p-3">
                {item.image && (
                  <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0 bg-muted">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-foreground truncate">{item.name}</p>
                  <p className="text-[12px] font-medium text-muted-foreground">{item.quantity} шт.</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-bold text-foreground">{item.price * item.quantity} ₽</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{item.price} ₽/шт.</p>
                </div>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-foreground/6">
            {order.delivery_fee > 0 && (
              <div className="flex justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">Доставка</span>
                <span className="text-[13px] font-bold text-foreground">{order.delivery_fee} ₽</span>
              </div>
            )}
            {order.promo_code && (
              <div className="flex justify-between">
                <span className="text-[13px] font-medium text-muted-foreground">
                  Промокод {order.promo_code}
                  {order.promo_discount ? ` (−${order.promo_discount}%)` : ''}
                </span>
                <span className="text-[13px] font-bold" style={{ color: '#2e8b57' }}>Применён</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[15px] font-bold text-foreground">Итого</span>
              <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>{order.total} ₽</span>
            </div>
          </div>
        </motion.section>

        {/* ── Delivery info ── */}
        <motion.section
          custom={2} variants={sectionVariants} initial="hidden" animate="visible"
          className="rounded-[24px] p-5 bg-muted flex flex-col gap-3"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Location01Icon} size={18} color="#2e8b57" />
            </div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Доставка</h2>
          </div>
          <InfoRow icon={Location01Icon} label="Адрес" value={order.address} />
          <InfoRow icon={SmartPhone01Icon} label="Телефон" value={order.phone} />
          {order.slot_date && order.slot_time && (
            <InfoRow
              icon={Clock01Icon}
              label="Слот"
              value={`${formatSlotDate(order.slot_date)} · ${order.slot_time}`}
            />
          )}
          <InfoRow icon={Cash01Icon} label="Оплата" value={order.payment_method === 'transfer' ? 'Переводом' : 'Наличные'} />
          {order.promo_code && (
            <InfoRow icon={DiscountTag01Icon} label="Промокод" value={order.promo_code} green />
          )}
        </motion.section>

        {/* ── Confirm button — only for delivering status ── */}
        {(isActive || isCompleted) && (
          <motion.div
            custom={3} variants={sectionVariants} initial="hidden" animate="visible"
          >
            {isCompleted ? (
              <div className="h-14 rounded-[20px] flex items-center justify-center gap-2"
                   style={{ background: 'rgba(59,130,246,0.08)', border: '2px solid rgba(59,130,246,0.2)' }}>
                <HugeiconsIcon icon={Tick01Icon} size={20} color="#3b82f6" />
                <span className="text-[15px] font-bold" style={{ color: '#3b82f6' }}>Получение подтверждено</span>
              </div>
            ) : (
              <motion.button
                onClick={handleConfirm}
                disabled={confirming}
                whileTap={!confirming ? { scale: 0.97 } : undefined}
                className="h-14 rounded-[20px] flex items-center justify-center gap-2 w-full"
                style={{ background: confirming ? '#e4e4e7' : '#09090b' }}
              >
                {confirming ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <HugeiconsIcon icon={Tick01Icon} size={20} color="#ffffff" />
                )}
                <span className="text-[15px] font-bold"
                      style={{ color: confirming ? '#a1a1aa' : '#ffffff' }}>
                  {confirming ? 'Подтверждаю…' : 'Подтвердить получение'}
                </span>
              </motion.button>
            )}
          </motion.div>
        )}

      </div>

      {/* Local toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-5 right-5 text-center py-3.5 rounded-[16px] text-[14px] font-bold text-white"
            style={{ bottom: '112px', zIndex: 999, background: '#09090b' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Small helper ──────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, green }: { icon: any; label: string; value: string; green?: boolean }) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-[16px] px-4 py-3">
      <HugeiconsIcon icon={icon} size={16} color="#9aa3ae" />
      <span className="text-[13px] font-medium text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-[14px] font-bold flex-1 min-w-0 truncate"
            style={{ color: green ? '#2e8b57' : '#09090b' }}>
        {value}
      </span>
    </div>
  )
}
