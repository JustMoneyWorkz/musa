import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, DeliveryBox01Icon, Refresh01Icon } from '@hugeicons/core-free-icons'
import { Order } from '../lib/api'

interface OrdersPageProps {
  onClose: () => void
  orders: Order[]
  loading: boolean
  onRefresh: () => void
  onOrderClick: (order: Order) => void
}

// ── Status display — maps DB statuses to task's visual groups ────────────────
// pending           → grey  (ожидает)
// confirmed/assembling/delivering → green (active)
// delivered         → blue  (completed)
// cancelled         → orange (paused/cancelled)

const STATUS_LABEL: Record<Order['status'], string> = {
  pending:    'Ожидает',
  confirmed:  'Активный',
  assembling: 'Активный',
  delivering: 'В пути',
  delivered:  'Доставлен',
  cancelled:  'Отменён',
}
const STATUS_COLOR: Record<Order['status'], string> = {
  pending:    '#a1a1aa',
  confirmed:  '#2e8b57',
  assembling: '#2e8b57',
  delivering: '#2e8b57',
  delivered:  '#3b82f6',
  cancelled:  '#f59e0b',
}
const STATUS_BG: Record<Order['status'], string> = {
  pending:    'rgba(161,161,170,0.12)',
  confirmed:  'rgba(46,139,87,0.10)',
  assembling: 'rgba(46,139,87,0.10)',
  delivering: 'rgba(46,139,87,0.10)',
  delivered:  'rgba(59,130,246,0.10)',
  cancelled:  'rgba(245,158,11,0.10)',
}

export function formatOrderDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function itemsSummary(items: Order['items']): string {
  return items
    .map(i => `${i.name.split(' ').slice(0, 2).join(' ')} ×${i.quantity}`)
    .join(', ')
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export { STATUS_LABEL, STATUS_COLOR, STATUS_BG }

export default function OrdersPage({ onClose, orders, loading, onRefresh, onOrderClick }: OrdersPageProps) {
  // Auto-refresh on mount — чтобы пользователь видел актуальный статус сразу при открытии,
  // без pull-to-refresh (статус мог быть обновлён админом пока страница была закрыта)
  useEffect(() => {
    onRefresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Мои заказы</h1>
        <motion.button
          onClick={onRefresh}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Обновить"
        >
          <HugeiconsIcon icon={Refresh01Icon} size={18} color="#09090b" />
        </motion.button>
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* Summary card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' }}
        >
          <div
            className="absolute w-36 h-36 rounded-full pointer-events-none"
            style={{ right: -40, top: -40, background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 72%)' }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
                 style={{ background: 'rgba(255,255,255,0.10)' }}>
              <HugeiconsIcon icon={DeliveryBox01Icon} size={24} color="#ffffff" />
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>Всего заказов</p>
              <p className="text-[22px] font-bold text-white tracking-tighter">
                {loading ? '…' : `${orders.length} ${pluralOrders(orders.length)}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Orders list */}
        <div>
          <h2 className="text-[18px] font-bold text-foreground tracking-tighter mb-3">История заказов</h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-[20px] p-8 bg-muted flex flex-col items-center gap-3 text-center"
            >
              <div className="w-14 h-14 rounded-[18px] bg-card flex items-center justify-center">
                <HugeiconsIcon icon={DeliveryBox01Icon} size={28} color="#9aa3ae" />
              </div>
              <p className="text-[15px] font-bold text-foreground">Заказов пока нет</p>
              <p className="text-[13px] font-medium text-muted-foreground">Оформите первый заказ в каталоге</p>
            </motion.div>
          ) : (
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-3"
            >
              {orders.map((order) => (
                <motion.button
                  key={order.id}
                  variants={itemVariants}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onOrderClick(order)}
                  className="w-full flex items-center gap-3 rounded-[20px] p-4 bg-muted text-left"
                >
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground">#{order.id}</span>
                      <span
                        className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ background: STATUS_BG[order.status], color: STATUS_COLOR[order.status] }}
                      >
                        {STATUS_LABEL[order.status]}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground truncate">
                      {itemsSummary(order.items)}
                    </p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[12px] font-medium text-muted-foreground">
                        {formatOrderDate(order.created_at)}
                        {order.slot_date && order.slot_time && (
                          <span className="ml-1.5">· {order.slot_time}</span>
                        )}
                      </p>
                      <p className="text-[15px] font-bold text-foreground">{order.total} ₽</p>
                    </div>
                  </div>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#9aa3ae" />
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

function pluralOrders(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'заказов'
  if (mod10 === 1) return 'заказ'
  if (mod10 >= 2 && mod10 <= 4) return 'заказа'
  return 'заказов'
}
