import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, DeliveryBox01Icon } from '@hugeicons/core-free-icons'

interface OrdersPageProps {
  onClose: () => void
}

const ORDERS = [
  {
    id: '#4821',
    date: '10 апр 2026',
    status: 'В пути',
    statusColor: '#f59e0b',
    statusBg: 'rgba(245,158,11,0.1)',
    items: 'Авокадо × 1, Брокколи × 2',
    total: 710,
  },
  {
    id: '#4807',
    date: '8 апр 2026',
    status: 'Доставлен',
    statusColor: '#2e8b57',
    statusBg: 'rgba(46,139,87,0.1)',
    items: 'Органические помидоры × 2, Бананы × 3',
    total: 1060,
  },
  {
    id: '#4795',
    date: '5 апр 2026',
    status: 'Доставлен',
    statusColor: '#2e8b57',
    statusBg: 'rgba(46,139,87,0.1)',
    items: 'Грецкий орех × 1, Груши × 2, Брокколи × 1',
    total: 1270,
  },
  {
    id: '#4780',
    date: '1 апр 2026',
    status: 'Доставлен',
    statusColor: '#2e8b57',
    statusBg: 'rgba(46,139,87,0.1)',
    items: 'Бананы × 2, Авокадо × 2',
    total: 940,
  },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function OrdersPage({ onClose }: OrdersPageProps) {
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
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* Summary */}
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
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.10)' }}>
              <HugeiconsIcon icon={DeliveryBox01Icon} size={24} color="#ffffff" />
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>Всего заказов</p>
              <p className="text-[22px] font-bold text-white tracking-tighter">24 доставки</p>
            </div>
          </div>
        </motion.div>

        {/* Orders list */}
        <div>
          <h2 className="text-[18px] font-bold text-foreground tracking-tighter mb-3">История заказов</h2>
          <motion.div
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-3"
          >
            {ORDERS.map((order) => (
              <motion.button
                key={order.id}
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center gap-3 rounded-[20px] p-4 bg-muted text-left"
              >
                <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-bold text-foreground">{order.id}</span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: order.statusBg, color: order.statusColor }}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-[13px] font-medium text-muted-foreground truncate">{order.items}</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12px] font-medium text-muted-foreground">{order.date}</p>
                    <p className="text-[15px] font-bold text-foreground">{order.total} ₽</p>
                  </div>
                </div>
                <HugeiconsIcon icon={ArrowRight01Icon} size={18} color="#9aa3ae" />
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
