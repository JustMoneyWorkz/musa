import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Location01Icon, Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

interface AddressesPageProps {
  onClose: () => void
}

const INITIAL_ADDRESSES = [
  {
    id: '1',
    label: 'Домой',
    address: 'ул. Зелёная, д. 12, кв. 34',
    city: 'Москва · Зелёный район',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Офис',
    address: 'пр. Ленина, д. 55, оф. 101',
    city: 'Москва · Центр',
    isDefault: false,
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

export default function AddressesPage({ onClose }: AddressesPageProps) {
  const [addresses, setAddresses] = useState(INITIAL_ADDRESSES)
  const [showToast, setShowToast] = useState(false)

  const handleAdd = () => {
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2500)
  }

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(a => a.id !== id))
  }

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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Адреса доставки</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* List */}
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-3"
        >
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              variants={itemVariants}
              layout
              className="flex items-center gap-3 rounded-[20px] p-4 bg-muted"
            >
              <div
                className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg, #b84a1d 0%, #d9642a 100%)' }}
              >
                <HugeiconsIcon icon={Location01Icon} size={22} color="#ffffff" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-bold text-foreground">{addr.label}</p>
                  {addr.isDefault && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,139,87,0.1)', color: '#2e8b57' }}>
                      Основной
                    </span>
                  )}
                </div>
                <p className="text-[13px] font-medium text-muted-foreground mt-0.5 truncate">{addr.address}</p>
                <p className="text-[12px] font-medium text-muted-foreground">{addr.city}</p>
              </div>
              <motion.button
                onClick={() => handleDelete(addr.id)}
                className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0"
                whileTap={{ scale: 0.85 }}
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} color="#9aa3ae" />
              </motion.button>
            </motion.div>
          ))}
        </motion.div>

        {/* Add button */}
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
          <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>Добавить адрес</span>
        </motion.button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-5 right-5 bg-foreground text-white text-center py-3.5 rounded-[16px] text-[14px] font-bold"
            style={{ zIndex: 80 }}
          >
            Функция добавления в разработке
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
