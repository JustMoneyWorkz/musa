import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowDown01Icon, CustomerService01Icon } from '@hugeicons/core-free-icons'

interface SupportPageProps {
  onClose: () => void
}

const FAQ = [
  {
    q: 'Как отследить заказ?',
    a: 'После подтверждения заказа вы получите уведомление с ссылкой для отслеживания. Статус также отображается в разделе «Мои заказы».',
  },
  {
    q: 'Можно ли изменить адрес доставки?',
    a: 'Адрес можно изменить до момента передачи заказа курьеру. Напишите в поддержку как можно скорее.',
  },
  {
    q: 'Как вернуть товар?',
    a: 'Возврат возможен в течение 24 часов после получения, если товар ненадлежащего качества. Сфотографируйте товар и напишите в поддержку.',
  },
  {
    q: 'Какие способы оплаты доступны?',
    a: 'Оплата картой Visa/Mastercard, через СБП, или наличными при получении.',
  },
  {
    q: 'Минимальная сумма заказа?',
    a: 'Минимальная сумма заказа — 500 ₽. При заказе от 1500 ₽ доставка бесплатна.',
  },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function SupportPage({ onClose }: SupportPageProps) {
  const [open, setOpen] = useState<number | null>(null)

  const toggle = (i: number) => setOpen(prev => prev === i ? null : i)

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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Поддержка</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-[24px] p-5 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #234fc7 0%, #3368f0 100%)' }}
        >
          <div
            className="absolute w-36 h-36 rounded-full pointer-events-none"
            style={{ right: -40, top: -40, background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 72%)' }}
          />
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <HugeiconsIcon icon={CustomerService01Icon} size={24} color="#ffffff" />
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>Среднее время ответа</p>
              <p className="text-[20px] font-bold text-white tracking-tighter">~ 5 минут</p>
            </div>
          </div>
        </motion.div>

        {/* FAQ */}
        <div>
          <h2 className="text-[18px] font-bold text-foreground tracking-tighter mb-3">Частые вопросы</h2>
          <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex flex-col gap-2">
            {FAQ.map((item, i) => (
              <motion.div key={i} variants={itemVariants} className="rounded-[18px] bg-muted overflow-hidden">
                <motion.button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-[15px] font-bold text-foreground flex-1">{item.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="shrink-0"
                  >
                    <HugeiconsIcon icon={ArrowDown01Icon} size={18} color="#9aa3ae" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      key="answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-[14px] font-medium text-muted-foreground leading-relaxed">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Write to support button */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          whileTap={{ scale: 0.97 }}
          className="w-full h-14 rounded-[20px] bg-foreground flex items-center justify-center gap-2.5"
        >
          <HugeiconsIcon icon={CustomerService01Icon} size={20} color="#ffffff" />
          <span className="text-[15px] font-bold text-white">Написать в поддержку</span>
        </motion.button>
      </div>
    </div>
  )
}
