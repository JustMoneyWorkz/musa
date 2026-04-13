import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, CreditCardIcon, Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

interface PaymentPageProps {
  onClose: () => void
}

const INITIAL_CARDS = [
  { id: '1', brand: 'Visa', last4: '2048', expiry: '09/27', isDefault: true, color: 'linear-gradient(135deg, #5a22c8 0%, #7b3aed 100%)' },
  { id: '2', brand: 'Mastercard', last4: '7731', expiry: '03/26', isDefault: false, color: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function PaymentPage({ onClose }: PaymentPageProps) {
  const [cards, setCards] = useState(INITIAL_CARDS)
  const [showToast, setShowToast] = useState(false)

  const handleAdd = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const handleDelete = (id: string) => {
    setCards(prev => prev.filter(c => c.id !== id))
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
        <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
          {cards.map((card) => (
            <motion.div
              key={card.id}
              variants={itemVariants}
              layout
              className="rounded-[20px] p-5 flex items-center gap-4 relative overflow-hidden"
              style={{ background: card.color }}
            >
              <div
                className="absolute w-32 h-32 rounded-full pointer-events-none"
                style={{ right: -30, top: -30, background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)' }}
              />
              <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 relative z-10" style={{ background: 'rgba(255,255,255,0.15)' }}>
                <HugeiconsIcon icon={CreditCardIcon} size={20} color="#ffffff" />
              </div>
              <div className="flex-1 min-w-0 relative z-10">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-white">{card.brand} •••• {card.last4}</p>
                  {card.isDefault && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.18)', color: '#ffffff' }}>
                      Основная
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Действует до {card.expiry}
                </p>
              </div>
              <motion.button
                onClick={() => handleDelete(card.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative z-10"
                style={{ background: 'rgba(255,255,255,0.15)' }}
                whileTap={{ scale: 0.85 }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} color="rgba(255,255,255,0.80)" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        <motion.button
          onClick={handleAdd}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-[20px] border-2 border-dashed flex items-center justify-center gap-2"
          style={{ borderColor: '#d4d4d8' }}
        >
          <HugeiconsIcon icon={Add01Icon} size={20} color="#2e8b57" />
          <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>Добавить карту</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-5 right-5 bg-foreground text-white text-center py-3.5 rounded-[16px] text-[14px] font-bold"
            style={{ zIndex: 200 }}
          >
            Функция добавления в разработке
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
