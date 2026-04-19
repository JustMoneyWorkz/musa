import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Add01Icon, Money02Icon } from '@hugeicons/core-free-icons'
import { TOAST_BOTTOM_FLAT } from '../lib/toast'

interface PaymentPageProps {
  onClose: () => void
  onShowToast?: (msg: string) => void
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function PaymentPage({ onClose }: PaymentPageProps) {
  const [toast, setToast] = useState(false)

  const showToast = () => {
    setToast(true)
    setTimeout(() => setToast(false), 2500)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-[110px]">
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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Способы оплаты</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-5">

        {/* Cash card */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="rounded-[20px] p-5 flex items-center gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0b7a43 0%, #2e8b57 100%)' }}
        >
          <div
            className="absolute w-32 h-32 rounded-full pointer-events-none"
            style={{ right: -30, top: -30, background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }}
          />
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 relative z-10" style={{ background: 'rgba(255,255,255,0.18)' }}>
            <HugeiconsIcon icon={Money02Icon} size={20} color="#ffffff" />
          </div>
          <div className="flex-1 min-w-0 relative z-10">
            <div className="flex items-center gap-2">
              <p className="text-[15px] font-bold text-white">Наличные</p>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff' }}>
                Основной
              </span>
            </div>
            <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
              Оплата при получении
            </p>
          </div>
        </motion.div>

        {/* Add card button */}
        <motion.button
          onClick={showToast}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-[20px] border-2 border-dashed flex items-center justify-center gap-2"
          style={{ borderColor: '#d4d4d8' }}
        >
          <HugeiconsIcon icon={Add01Icon} size={20} color="#2e8b57" />
          <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>Добавить карту</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed left-5 right-5 bg-foreground text-white text-center py-3.5 rounded-[16px] text-[14px] font-bold"
            style={{ bottom: TOAST_BOTTOM_FLAT, zIndex: 999 }}
          >
            Функция добавления в разработке
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
