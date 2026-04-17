import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  User02Icon,
  Location01Icon,
  SmartPhone01Icon,
  Clock01Icon,
  DeliveryBox01Icon,
  Tick01Icon,
  CheckmarkCircle01Icon,
  CreditCardAcceptIcon,
  DiscountTag01Icon,
} from '@hugeicons/core-free-icons'
import { Product } from '../components/ProductCard'
import { Address, DeliverySlot, slotsApi, ordersApi, promoApi, ApiError, PromoResult } from '../lib/api'

interface CartItem {
  product: Product
  qty: number
}

interface CheckoutPageProps {
  items: CartItem[]
  onClose: () => void
  onConfirm: (orderId: number) => void
  savedAddresses: Address[]
  onSaveAddress: (data: { address: string; label?: string }) => Promise<{ error?: string }>
}

const DELIVERY_FEE = 299

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
}

function formatSlotDate(dateStr: string): string {
  // dateStr is 'YYYY-MM-DD' from postgres DATE
  const [y, m, d] = dateStr.split('-').map(Number)
  const slotDate = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  const dayAfter = new Date(today); dayAfter.setDate(today.getDate() + 2)
  if (slotDate.getTime() === today.getTime()) return 'Сегодня'
  if (slotDate.getTime() === tomorrow.getTime()) return 'Завтра'
  if (slotDate.getTime() === dayAfter.getTime()) return 'Послезавтра'
  return slotDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

export default function CheckoutPage({
  items, onClose, onConfirm, savedAddresses, onSaveAddress,
}: CheckoutPageProps) {
  // Contact
  const [firstName, setFirstName] = useState('')
  const [lastName,  setLastName]  = useState('')
  const [phone,     setPhone]     = useState('')

  // Address
  const [selectedAddrId, setSelectedAddrId] = useState<number | 'new'>(
    savedAddresses[0]?.id ?? 'new'
  )
  const [newAddress,     setNewAddress]     = useState('')
  const [saveNewAddr,    setSaveNewAddr]    = useState(false)

  // Slots
  const [slots,    setSlots]    = useState<DeliverySlot[]>([])
  const [slotId,   setSlotId]   = useState<number | null>(null)

  // Payment
  const [payment, setPayment] = useState<'cash' | 'transfer'>('cash')

  // Promo
  const [promoInput,   setPromoInput]   = useState('')
  const [promoData,    setPromoData]    = useState<PromoResult | null>(null)
  const [checkingPromo, setCheckingPromo] = useState(false)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [confirmed,  setConfirmed]  = useState(false)
  const [orderId,    setOrderId]    = useState<number | null>(null)

  // Toast
  const [toast, setToast] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2800)
  }

  // Fetch slots on mount
  useEffect(() => {
    slotsApi.get()
      .then(data => {
        setSlots(data)
        if (data.length > 0) setSlotId(data[0].id)
      })
      .catch(() => {}) // no slots — not critical
  }, [])

  // Keep selected address in sync when savedAddresses loads
  useEffect(() => {
    if (selectedAddrId === 'new' && savedAddresses.length > 0) {
      setSelectedAddrId(savedAddresses[0].id)
    }
  }, [savedAddresses.length]) // eslint-disable-line

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const discount = promoData ? Math.round(subtotal * promoData.discount_percent / 100) : 0
  const total = subtotal + DELIVERY_FEE - discount

  const handleCheckPromo = async () => {
    if (!promoInput.trim()) return
    setCheckingPromo(true)
    try {
      const result = await promoApi.check(promoInput.trim())
      setPromoData(result)
      showToast(`Промокод применён, скидка ${result.discount_percent}%`)
    } catch (err) {
      setPromoData(null)
      if (err instanceof ApiError) {
        if (err.status === 410) showToast('Промокод просрочен')
        else if (err.status === 404) showToast('Промокод не найден')
        else showToast('Ошибка проверки промокода')
      }
    } finally {
      setCheckingPromo(false)
    }
  }

  const handleSubmit = async () => {
    if (submitting) return

    // Validation
    if (items.length === 0) { showToast('Корзина пуста'); return }
    if (!phone.trim()) { showToast('Введите номер телефона'); return }
    const addrText = selectedAddrId === 'new'
      ? newAddress.trim()
      : savedAddresses.find(a => a.id === selectedAddrId)?.address ?? ''
    if (!addrText) { showToast('Введите адрес доставки'); return }

    if (payment === 'transfer') { showToast('Обсудите с менеджером'); return }

    setSubmitting(true)

    // Save new address to profile if checked
    if (selectedAddrId === 'new' && saveNewAddr && newAddress.trim()) {
      await onSaveAddress({ address: newAddress.trim() })
    }

    try {
      const order = await ordersApi.create({
        items: items.map(({ product, qty }) => ({
          product_id: parseInt(product.id),
          quantity: qty,
        })),
        address: addrText,
        phone: phone.trim(),
        delivery_slot_id: slotId ?? undefined,
        promo_code: promoData?.code ?? undefined,
      })
      setOrderId(order.id)
      setConfirmed(true)
      setTimeout(() => onConfirm(order.id), 2000)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Ошибка создания заказа'
      showToast(msg)
      setSubmitting(false)
    }
  }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-5 px-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          className="w-24 h-24 rounded-[32px] flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #16a34a 0%, #2e8b57 100%)' }}
        >
          <HugeiconsIcon icon={Tick01Icon} size={44} color="#ffffff" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h2 className="text-[26px] font-bold text-foreground tracking-tighter mb-2">Заявка принята!</h2>
          <p className="text-[15px] font-medium text-muted-foreground">
            {orderId ? `Заказ #${orderId} · ` : ''}Мы свяжемся с вами
          </p>
        </motion.div>
      </div>
    )
  }

  // ── Main form ───────────────────────────────────────────────────────────────
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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Оформление заказа</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="px-5 flex flex-col gap-4"
      >

        {/* ── Contact ── */}
        <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-4">
          <SectionHeader icon={User02Icon} title="Получатель" />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Имя">
              <input value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Алексей" className={inputCls} />
            </Field>
            <Field label="Фамилия">
              <input value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Иванов" className={inputCls} />
            </Field>
          </div>
          <Field label="Телефон">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <HugeiconsIcon icon={SmartPhone01Icon} size={16} color="#9aa3ae" />
              </div>
              <input value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+7 (999) 000-00-00" type="tel"
                className={`${inputCls} pl-10`} />
            </div>
          </Field>
        </motion.section>

        {/* ── Address ── */}
        <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
          <SectionHeader icon={Location01Icon} title="Адрес доставки" />

          {savedAddresses.length > 0 && (
            <div className="flex flex-col gap-2">
              {savedAddresses.map(addr => (
                <motion.button
                  key={addr.id}
                  onClick={() => setSelectedAddrId(addr.id)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-3 rounded-[16px] p-3 text-left transition-colors"
                  style={{
                    background: selectedAddrId === addr.id ? '#09090b' : 'rgba(255,255,255,0)',
                    border: `2px solid ${selectedAddrId === addr.id ? '#09090b' : '#e4e4e7'}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold truncate"
                       style={{ color: selectedAddrId === addr.id ? '#fff' : '#09090b' }}>
                      {addr.label}
                    </p>
                    <p className="text-[12px] font-medium truncate"
                       style={{ color: selectedAddrId === addr.id ? 'rgba(255,255,255,0.65)' : '#9aa3ae' }}>
                      {addr.address}
                    </p>
                  </div>
                  {selectedAddrId === addr.id && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="#fff" />
                  )}
                </motion.button>
              ))}
              <motion.button
                onClick={() => setSelectedAddrId('new')}
                whileTap={{ scale: 0.97 }}
                className="w-full rounded-[16px] py-2.5 text-center text-[13px] font-bold transition-colors"
                style={{
                  background: selectedAddrId === 'new' ? '#09090b' : 'rgba(255,255,255,0)',
                  border: `2px solid ${selectedAddrId === 'new' ? '#09090b' : '#e4e4e7'}`,
                  color: selectedAddrId === 'new' ? '#fff' : '#09090b',
                }}
              >
                + Новый адрес
              </motion.button>
            </div>
          )}

          <AnimatePresence>
            {(selectedAddrId === 'new' || savedAddresses.length === 0) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                className="overflow-hidden flex flex-col gap-2"
              >
                <input
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  placeholder="ул. Зелёная, д. 12, кв. 34"
                  className={inputCls}
                />
                <label className="flex items-center gap-2 cursor-pointer px-1">
                  <div
                    onClick={() => setSaveNewAddr(v => !v)}
                    className="w-5 h-5 rounded-[6px] flex items-center justify-center shrink-0 transition-colors"
                    style={{ background: saveNewAddr ? '#09090b' : 'transparent', border: `2px solid ${saveNewAddr ? '#09090b' : '#d4d4d8'}` }}
                  >
                    {saveNewAddr && <HugeiconsIcon icon={Tick01Icon} size={11} color="#fff" />}
                  </div>
                  <span className="text-[13px] font-medium text-muted-foreground">Сохранить в профиль</span>
                </label>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* ── Delivery slot ── */}
        {slots.length > 0 && (
          <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-4">
            <SectionHeader icon={Clock01Icon} title="Слот доставки" />
            <div className="flex flex-col gap-2">
              {slots.map(s => (
                <motion.button
                  key={s.id}
                  onClick={() => setSlotId(s.id)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-between rounded-[16px] py-3 px-4 text-left transition-colors"
                  style={{
                    background: slotId === s.id ? '#09090b' : 'rgba(255,255,255,0)',
                    border: `2px solid ${slotId === s.id ? '#09090b' : '#e4e4e7'}`,
                  }}
                >
                  <div>
                    <span className="text-[14px] font-bold"
                          style={{ color: slotId === s.id ? '#fff' : '#09090b' }}>
                      {formatSlotDate(s.date)}
                    </span>
                    <span className="text-[13px] font-medium ml-2"
                          style={{ color: slotId === s.id ? 'rgba(255,255,255,0.65)' : '#9aa3ae' }}>
                      {s.time_range}
                    </span>
                  </div>
                  {slotId === s.id && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} color="#fff" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Payment ── */}
        <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-4">
          <SectionHeader icon={CreditCardAcceptIcon} title="Способ оплаты" />
          <div className="grid grid-cols-2 gap-2">
            {(['cash', 'transfer'] as const).map(method => (
              <motion.button
                key={method}
                onClick={() => {
                  setPayment(method)
                  if (method === 'transfer') showToast('Обсудите с менеджером')
                }}
                whileTap={{ scale: 0.94 }}
                className="rounded-[16px] py-3 px-4 text-center transition-colors"
                style={{
                  background: payment === method ? '#09090b' : 'rgba(255,255,255,0)',
                  border: `2px solid ${payment === method ? '#09090b' : '#e4e4e7'}`,
                }}
              >
                <span className="text-[14px] font-bold"
                      style={{ color: payment === method ? '#fff' : '#09090b' }}>
                  {method === 'cash' ? 'Наличные' : 'Переводом'}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* ── Promo code ── */}
        <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
          <SectionHeader icon={DiscountTag01Icon} title="Промокод" />
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoData(null) }}
              placeholder="MUSA10"
              className={`${inputCls} flex-1 uppercase`}
              disabled={!!promoData}
            />
            {promoData ? (
              <motion.button
                onClick={() => { setPromoData(null); setPromoInput('') }}
                whileTap={{ scale: 0.9 }}
                className="h-12 px-4 rounded-[14px] text-[13px] font-bold"
                style={{ background: 'rgba(46,139,87,0.12)', color: '#2e8b57' }}
              >
                Убрать
              </motion.button>
            ) : (
              <motion.button
                onClick={handleCheckPromo}
                disabled={!promoInput.trim() || checkingPromo}
                whileTap={{ scale: 0.9 }}
                className="h-12 px-4 rounded-[14px] text-[13px] font-bold text-white"
                style={{ background: promoInput.trim() ? '#09090b' : '#e4e4e7' }}
              >
                {checkingPromo ? '…' : 'Применить'}
              </motion.button>
            )}
          </div>
          {promoData && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-1"
            >
              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} color="#2e8b57" />
              <span className="text-[13px] font-bold" style={{ color: '#2e8b57' }}>
                {promoData.code} — скидка {promoData.discount_percent}%
              </span>
            </motion.div>
          )}
        </motion.section>

        {/* ── Order summary ── */}
        <motion.section variants={itemVariants} className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
          <SectionHeader icon={DeliveryBox01Icon} title="Ваш заказ" />
          <div className="flex flex-col gap-2">
            {items.map(({ product, qty }) => (
              <div key={product.id} className="flex items-center gap-3 bg-card rounded-[16px] p-3">
                <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0 bg-muted">
                  <img src={product.imageSrc} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-foreground truncate">{product.title}</p>
                  <p className="text-[12px] font-medium text-muted-foreground">{product.weight}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[14px] font-bold text-foreground">{product.price * qty} ₽</p>
                  <p className="text-[11px] font-medium text-muted-foreground">{qty} шт.</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-foreground/6">
            <Row label="Подытог" value={`${subtotal} ₽`} />
            <Row label="Доставка" value={`${DELIVERY_FEE} ₽`} />
            {discount > 0 && (
              <Row label={`Скидка (${promoData!.discount_percent}%)`} value={`−${discount} ₽`} green />
            )}
            <div className="flex justify-between pt-1 border-t border-foreground/6">
              <span className="text-[15px] font-bold text-foreground">Итого</span>
              <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>{total} ₽</span>
            </div>
          </div>
        </motion.section>

        {/* ── Submit button ── */}
        <motion.button
          variants={itemVariants}
          onClick={handleSubmit}
          disabled={submitting}
          whileTap={!submitting ? { scale: 0.97 } : undefined}
          className="h-14 rounded-[20px] flex items-center justify-between px-5 w-full"
          style={{ background: submitting ? '#e4e4e7' : '#09090b' }}
        >
          <span className="text-base font-bold" style={{ color: submitting ? '#a1a1aa' : '#fff' }}>
            {submitting ? 'Создаём заказ…' : 'Оставить заявку'}
          </span>
          {!submitting && (
            <span className="rounded-2xl px-3 py-2.5 text-[14px] font-bold text-white leading-none"
                  style={{ background: 'rgba(255,255,255,0.12)' }}>
              {total} ₽
            </span>
          )}
        </motion.button>

      </motion.div>

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

// ── Small helpers ─────────────────────────────────────────────────────────────

const inputCls = 'h-12 w-full rounded-[14px] bg-card px-4 text-[15px] font-medium text-foreground placeholder:text-muted-foreground outline-none border-2 border-transparent focus:border-foreground/10 transition-colors'

function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
        <HugeiconsIcon icon={icon} size={18} color="#2e8b57" />
      </div>
      <h2 className="text-[18px] font-bold text-foreground tracking-tighter">{title}</h2>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-muted-foreground px-1">{label}</label>
      {children}
    </div>
  )
}

function Row({ label, value, green }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-[14px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[14px] font-bold" style={{ color: green ? '#2e8b57' : '#09090b' }}>{value}</span>
    </div>
  )
}
