import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, Location01Icon, Add01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'
import { Address } from '../lib/api'

interface AddressesHook {
  addresses: Address[]
  loading: boolean
  canAdd: boolean
  addAddress: (data: { address: string; label?: string; is_default?: boolean }) => Promise<{ error?: string }>
  removeAddress: (id: number) => Promise<void>
  setDefault: (id: number) => Promise<void>
}

interface AddressesPageProps {
  onClose: () => void
  addressesHook?: AddressesHook
  onShowToast?: (msg: string) => void
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function AddressesPage({ onClose, addressesHook, onShowToast }: AddressesPageProps) {
  const [showForm, setShowForm] = useState(false)
  const [inputLabel, setInputLabel] = useState('')
  const [inputAddress, setInputAddress] = useState('')
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const addresses = addressesHook?.addresses ?? []
  const canAdd = addressesHook?.canAdd ?? true

  const handleDelete = async (id: number) => {
    await addressesHook?.removeAddress(id)
  }

  const handleSetDefault = async (id: number) => {
    await addressesHook?.setDefault(id)
  }

  const handleSubmitAdd = async () => {
    if (!inputAddress.trim()) { setFormError('Введите адрес'); return }
    setSaving(true)
    setFormError('')
    const result = await addressesHook?.addAddress({
      address: inputAddress.trim(),
      label: inputLabel.trim() || 'Новый адрес',
    })
    setSaving(false)
    if (result?.error) { setFormError(result.error); return }
    setInputLabel('')
    setInputAddress('')
    setShowForm(false)
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
        {addressesHook?.loading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
          </div>
        ) : (
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
                <motion.button
                  onClick={() => handleSetDefault(addr.id)}
                  className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, #b84a1d 0%, #d9642a 100%)' }}
                  whileTap={{ scale: 0.88 }}
                  aria-label="Сделать основным"
                >
                  <HugeiconsIcon icon={Location01Icon} size={22} color="#ffffff" />
                </motion.button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[15px] font-bold text-foreground">{addr.label}</p>
                    {addr.is_default && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(46,139,87,0.1)', color: '#2e8b57' }}>
                        Основной
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] font-medium text-muted-foreground mt-0.5 truncate">{addr.address}</p>
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
        )}

        {/* Add form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-[20px] bg-muted p-4 flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Название (Дом, Офис…)"
                  value={inputLabel}
                  onChange={e => setInputLabel(e.target.value)}
                  className="w-full h-11 rounded-[14px] bg-card px-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground outline-none"
                />
                <input
                  type="text"
                  placeholder="Адрес доставки"
                  value={inputAddress}
                  onChange={e => setInputAddress(e.target.value)}
                  className="w-full h-11 rounded-[14px] bg-card px-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground outline-none"
                />
                {formError && (
                  <p className="text-[13px] font-medium" style={{ color: '#e74c3c' }}>{formError}</p>
                )}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => { setShowForm(false); setFormError(''); setInputLabel(''); setInputAddress('') }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 h-11 rounded-[14px] bg-card text-[15px] font-bold text-muted-foreground"
                  >
                    Отмена
                  </motion.button>
                  <motion.button
                    onClick={handleSubmitAdd}
                    disabled={saving}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 h-11 rounded-[14px] text-[15px] font-bold text-white"
                    style={{ background: saving ? '#d4d4d8' : '#09090b' }}
                  >
                    {saving ? 'Сохраняю…' : 'Сохранить'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add button — hidden at limit */}
        {canAdd && !showForm && (
          <motion.button
            onClick={() => setShowForm(true)}
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
        )}

        {!canAdd && (
          <p className="text-center text-[13px] font-medium text-muted-foreground">
            Максимум 5 адресов
          </p>
        )}
      </div>

    </div>
  )
}
