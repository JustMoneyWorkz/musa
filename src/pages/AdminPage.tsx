import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  ArrowLeft01Icon,
  PlusSignIcon,
  Search01Icon,
  Edit01Icon,
  Delete01Icon,
  Cancel01Icon,
  CrownIcon,
  User02Icon,
  SmartPhone01Icon,
  Location01Icon,
  Clock01Icon,
  Package01Icon,
  TelegramIcon,
  DeliveryBox01Icon,
  DiscountTag01Icon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons'
import {
  AdminProduct, AdminOrder, AdminPromo, AdminDeliverySlot,
  productsAdminApi, adminOrdersApi, adminPromosApi, adminSlotsApi,
  ApiError,
} from '../lib/api'

interface AdminPageProps {
  isAdmin: boolean
  onClose: () => void
  onProductsChanged?: () => void
}

// ── Status display ───────────────────────────────────────────────────────────
type OrderStatus = AdminOrder['status']

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    'Ожидает',
  confirmed:  'Подтверждён',
  assembling: 'Сборка',
  delivering: 'В пути',
  delivered:  'Доставлен',
  cancelled:  'Отменён',
}
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:    '#a1a1aa',
  confirmed:  '#2e8b57',
  assembling: '#2e8b57',
  delivering: '#2e8b57',
  delivered:  '#3b82f6',
  cancelled:  '#f59e0b',
}
const STATUS_BG: Record<OrderStatus, string> = {
  pending:    'rgba(161,161,170,0.12)',
  confirmed:  'rgba(46,139,87,0.10)',
  assembling: 'rgba(46,139,87,0.10)',
  delivering: 'rgba(46,139,87,0.10)',
  delivered:  'rgba(59,130,246,0.10)',
  cancelled:  'rgba(245,158,11,0.10)',
}
const ALL_STATUSES: OrderStatus[] = [
  'pending','confirmed','assembling','delivering','delivered','cancelled',
]

function formatOrderDate(isoStr: string): string {
  const d = new Date(isoStr)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatSlotDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Сегодня'
  if (date.getTime() === tomorrow.getTime()) return 'Завтра'
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

function buildContactMessage(order: AdminOrder): string {
  const items = order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')
  const slot = order.slot_date
    ? `${formatSlotDate(order.slot_date)}${order.slot_time ? ' ' + order.slot_time : ''}`
    : 'дата не указана'
  return (
    `Приветствую! Я менеджер СВОЙнабор. Скажите, это ваш заказ?\n\n` +
    `Состав: ${items}\n` +
    `Телефон: ${order.phone}\n` +
    `Адрес: ${order.address}\n` +
    `Доставка: ${slot}`
  )
}

// ── Promo helpers ────────────────────────────────────────────────────────────
interface PromoForm {
  code: string
  discount_percent: string
  active_from: string  // YYYY-MM-DD
  active_to: string    // YYYY-MM-DD
}
const EMPTY_PROMO_FORM: PromoForm = { code:'', discount_percent:'', active_from:'', active_to:'' }

function getPromoStatus(p: AdminPromo): { label:string; color:string; bg:string } {
  const now = new Date()
  const to  = new Date(p.active_to)
  const from = new Date(p.active_from)
  if (to < now)   return { label:'Истёк',      color:'#f59e0b', bg:'rgba(245,158,11,0.10)' }
  if (from > now) return { label:'Предстоит',  color:'#3b82f6', bg:'rgba(59,130,246,0.10)' }
  return           { label:'Активен',    color:'#2e8b57', bg:'rgba(46,139,87,0.10)'  }
}

function formatPromoDate(isoStr: string): string {
  return new Date(isoStr).toLocaleDateString('ru-RU', { day:'numeric', month:'short', year:'numeric' })
}

// ── Slot helpers ─────────────────────────────────────────────────────────────
interface SlotForm {
  date: string         // YYYY-MM-DD
  time_range: string   // '09:00 — 12:00'
  districts: string    // comma-separated
}
const EMPTY_SLOT_FORM: SlotForm = { date:'', time_range:'', districts:'' }

function formatFullSlotDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(); today.setHours(0,0,0,0)
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1)
  if (date.getTime() === today.getTime()) return 'Сегодня'
  if (date.getTime() === tomorrow.getTime()) return 'Завтра'
  return date.toLocaleDateString('ru-RU', { day:'numeric', month:'long', weekday:'short' })
}

// ── Form state (products) ────────────────────────────────────────────────────
interface FormState {
  name: string; price: string; price_discounted: string; weight: string
  category: string; images: string; origin: string; tags: string
  description: string; stock: string; calories: string; carbs: string
  fats: string; ripeness: string
}
const EMPTY_FORM: FormState = {
  name:'', price:'', price_discounted:'', weight:'',
  category:'', images:'', origin:'', tags:'', description:'',
  stock:'', calories:'', carbs:'', fats:'', ripeness:'',
}
function productToForm(p: AdminProduct): FormState {
  return {
    name: p.name, price: String(p.price),
    price_discounted: p.price_discounted != null ? String(p.price_discounted) : '',
    weight: p.weight, category: p.category,
    images: p.images.join('\n'), origin: p.origin ?? '',
    tags: (p.tags ?? []).join(', '), description: p.description ?? '',
    stock: String(p.stock),
    calories: p.calories != null ? String(p.calories) : '',
    carbs: p.carbs != null ? String(p.carbs) : '',
    fats: p.fats != null ? String(p.fats) : '',
    ripeness: p.ripeness ?? '',
  }
}
function formToPayload(f: FormState): Omit<AdminProduct, 'id'|'created_at'> {
  return {
    name: f.name.trim(), price: parseInt(f.price)||0,
    price_discounted: f.price_discounted ? parseInt(f.price_discounted) : null,
    weight: f.weight.trim(), category: f.category.trim(),
    images: f.images.split('\n').map(s=>s.trim()).filter(Boolean),
    origin: f.origin.trim()||null,
    tags: f.tags ? f.tags.split(',').map(s=>s.trim()).filter(Boolean) : [],
    description: f.description.trim()||null,
    stock: parseInt(f.stock)||0,
    calories: f.calories ? parseFloat(f.calories) : null,
    carbs: f.carbs ? parseFloat(f.carbs) : null,
    fats: f.fats ? parseFloat(f.fats) : null,
    ripeness: f.ripeness.trim()||null,
  }
}

const sv = {
  hidden: { opacity:0, y:12 },
  visible: (i:number) => ({
    opacity:1, y:0,
    transition:{ duration:0.28, delay: i*0.05, ease:[0.25,0.46,0.45,0.94] }
  }),
}
const overlayV = {
  hidden:  { y:'100%', opacity:0 },
  visible: { y:0, opacity:1 },
  exit:    { y:'100%', opacity:0 },
}

// ════════════════════════════════════════════════════════════════════════════
export default function AdminPage({ isAdmin, onClose, onProductsChanged }: AdminPageProps) {

  // ── toast ──
  const [toast, setToast] = useState<string|null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(msg)
    toastTimer.current = setTimeout(()=>setToast(null), 2800)
  }

  // ── tab ──
  const [view, setView] = useState<'products'|'orders'|'promos'|'slots'>('products')

  // ── products state ──
  const [products,   setProducts]   = useState<AdminProduct[]>([])
  const [prodLoading, setProdLoading] = useState(true)
  const [search,     setSearch]     = useState('')
  const [formOpen,   setFormOpen]   = useState(false)
  const [editProduct,setEditProduct] = useState<AdminProduct|null>(null)
  const [form,       setForm]       = useState<FormState>(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [justAdded,  setJustAdded]  = useState(false)
  const [deleteTarget,setDeleteTarget] = useState<AdminProduct|null>(null)
  const [deleting,   setDeleting]   = useState(false)

  // ── orders state ──
  const [orders,       setOrders]       = useState<AdminOrder[]>([])
  const [ordersLoading,setOrdersLoading] = useState(false)
  const [ordersFetched,setOrdersFetched] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrder,setSelectedOrder] = useState<AdminOrder|null>(null)
  const [updatingStatus,setUpdatingStatus] = useState(false)

  // ── promos state ──
  const [promos,       setPromos]       = useState<AdminPromo[]>([])
  const [promosLoading,setPromosLoading] = useState(false)
  const [promosFetched,setPromosFetched] = useState(false)
  const [promoFormOpen,setPromoFormOpen] = useState(false)
  const [promoForm,    setPromoForm]    = useState<PromoForm>(EMPTY_PROMO_FORM)
  const [savingPromo,  setSavingPromo]  = useState(false)
  const [promoDeleteTarget,setPromoDeleteTarget] = useState<AdminPromo|null>(null)
  const [deletingPromo,setDeletingPromo] = useState(false)

  // ── slots state ──
  const [slots,        setSlots]        = useState<AdminDeliverySlot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [slotsFetched, setSlotsFetched] = useState(false)
  const [slotFormOpen, setSlotFormOpen] = useState(false)
  const [slotForm,     setSlotForm]     = useState<SlotForm>(EMPTY_SLOT_FORM)
  const [savingSlot,   setSavingSlot]   = useState(false)
  const [slotDeleteTarget,setSlotDeleteTarget] = useState<AdminDeliverySlot|null>(null)
  const [deletingSlot, setDeletingSlot] = useState(false)

  // ── load products ──
  useEffect(() => {
    if (!isAdmin) return
    productsAdminApi.getAll()
      .then(setProducts)
      .catch(err => {
        const msg = err instanceof ApiError ? err.message : 'Ошибка загрузки товаров'
        showToast(`Ошибка загрузки: ${msg}`)
      })
      .finally(()=>setProdLoading(false))
  }, [isAdmin])

  // ── load orders (lazy) ──
  useEffect(() => {
    if (!isAdmin || view !== 'orders' || ordersFetched) return
    setOrdersLoading(true)
    adminOrdersApi.getAll()
      .then(data => { setOrders(data); setOrdersFetched(true) })
      .catch(()=>showToast('Ошибка загрузки заказов'))
      .finally(()=>setOrdersLoading(false))
  }, [isAdmin, view, ordersFetched])

  // ── load promos (lazy) ──
  useEffect(() => {
    if (!isAdmin || view !== 'promos' || promosFetched) return
    setPromosLoading(true)
    adminPromosApi.getAll()
      .then(data => { setPromos(data); setPromosFetched(true) })
      .catch(()=>showToast('Ошибка загрузки промокодов'))
      .finally(()=>setPromosLoading(false))
  }, [isAdmin, view, promosFetched])

  // ── load slots (lazy) ──
  useEffect(() => {
    if (!isAdmin || view !== 'slots' || slotsFetched) return
    setSlotsLoading(true)
    adminSlotsApi.getAll()
      .then(data => { setSlots(data); setSlotsFetched(true) })
      .catch(()=>showToast('Ошибка загрузки слотов'))
      .finally(()=>setSlotsLoading(false))
  }, [isAdmin, view, slotsFetched])

  // ── filtered products ──
  const q = search.toLowerCase()
  const filteredProducts = q
    ? products.filter(p => p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))
    : products

  // ── filtered orders ──
  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter)

  // ── product form actions ──
  const openAdd  = () => { setEditProduct(null); setForm(EMPTY_FORM); setFormOpen(true) }
  const openEdit = (p: AdminProduct) => { setEditProduct(p); setForm(productToForm(p)); setFormOpen(true) }

  const handleSave = async () => {
    if (saving || justAdded) return
    const payload = formToPayload(form)
    if (!payload.name||!payload.price||!payload.weight||!payload.category) {
      showToast('Заполните обязательные поля'); return
    }
    setSaving(true)
    try {
      if (editProduct) {
        const updated = await productsAdminApi.update(editProduct.id, payload)
        setProducts(prev => prev.map(p => p.id===updated.id ? updated : p))
        onProductsChanged?.()
        showToast('Товар обновлён')
        setFormOpen(false)
      } else {
        const created = await productsAdminApi.create(payload)
        setProducts(prev => [created, ...prev])
        onProductsChanged?.()
        setSaving(false)
        setJustAdded(true)
        setTimeout(() => {
          setFormOpen(false)
          setJustAdded(false)
        }, 1000)
        return
      }
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка сохранения')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget||deleting) return
    setDeleting(true)
    try {
      await productsAdminApi.delete(deleteTarget.id)
      setProducts(prev => prev.filter(p => p.id!==deleteTarget.id))
      onProductsChanged?.()
      showToast('Товар удалён'); setDeleteTarget(null)
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка удаления')
    } finally { setDeleting(false) }
  }

  // ── status change ──
  const handleStatusChange = async (newStatus: string) => {
    if (!selectedOrder || updatingStatus || selectedOrder.status === newStatus) return
    setUpdatingStatus(true)
    try {
      const result = await adminOrdersApi.updateStatus(selectedOrder.id, newStatus)
      const updated = { ...selectedOrder, status: result.status as AdminOrder['status'] }
      setSelectedOrder(updated)
      setOrders(prev => prev.map(o => o.id===updated.id ? updated : o))
      showToast('Статус изменён')
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка смены статуса')
    } finally { setUpdatingStatus(false) }
  }

  // ── promo actions ──
  const handleSavePromo = async () => {
    if (savingPromo) return
    const { code, discount_percent, active_from, active_to } = promoForm
    if (!code.trim()||!discount_percent||!active_from||!active_to) {
      showToast('Заполните все поля'); return
    }
    const pct = parseInt(discount_percent)
    if (isNaN(pct)||pct<1||pct>100) { showToast('Скидка от 1 до 100%'); return }
    if (active_from >= active_to) { showToast('Дата начала должна быть раньше конца'); return }
    setSavingPromo(true)
    try {
      const created = await adminPromosApi.create({
        code: code.trim().toUpperCase(),
        discount_percent: pct,
        active_from: `${active_from}T00:00:00.000Z`,
        active_to:   `${active_to}T23:59:59.000Z`,
      })
      setPromos(prev => [created, ...prev])
      setPromoFormOpen(false)
      setPromoForm(EMPTY_PROMO_FORM)
      showToast(`Промокод ${created.code} создан`)
    } catch(err) {
      const e = err instanceof ApiError
      showToast(e && (err as ApiError).status === 409 ? 'Такой код уже существует' : 'Ошибка создания')
    } finally { setSavingPromo(false) }
  }

  const handleDeletePromo = async () => {
    if (!promoDeleteTarget||deletingPromo) return
    setDeletingPromo(true)
    try {
      await adminPromosApi.delete(promoDeleteTarget.id)
      setPromos(prev => prev.filter(p => p.id!==promoDeleteTarget.id))
      showToast(`Промокод ${promoDeleteTarget.code} удалён`)
      setPromoDeleteTarget(null)
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка удаления')
    } finally { setDeletingPromo(false) }
  }

  // ── slot actions ──
  const handleSaveSlot = async () => {
    if (savingSlot) return
    const { date, time_range, districts } = slotForm
    if (!date || !time_range.trim() || !districts.trim()) {
      showToast('Заполните все поля'); return
    }
    const districtsArr = districts.split(',').map(s => s.trim()).filter(Boolean)
    if (districtsArr.length === 0) { showToast('Укажите хотя бы один район'); return }
    setSavingSlot(true)
    try {
      const created = await adminSlotsApi.create({
        date, time_range: time_range.trim(), districts: districtsArr,
      })
      setSlots(prev => {
        const next = [...prev, created]
        next.sort((a, b) => a.date.localeCompare(b.date) || a.time_range.localeCompare(b.time_range))
        return next
      })
      setSlotFormOpen(false)
      setSlotForm(EMPTY_SLOT_FORM)
      showToast('Слот создан')
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка создания слота')
    } finally { setSavingSlot(false) }
  }

  const handleDeleteSlot = async () => {
    if (!slotDeleteTarget || deletingSlot) return
    setDeletingSlot(true)
    try {
      await adminSlotsApi.delete(slotDeleteTarget.id)
      setSlots(prev => prev.filter(s => s.id !== slotDeleteTarget.id))
      showToast('Слот удалён')
      setSlotDeleteTarget(null)
    } catch(err) {
      showToast(err instanceof ApiError ? err.message : 'Ошибка удаления')
    } finally { setDeletingSlot(false) }
  }

  // ── contact ──
  const handleContact = () => {
    if (!selectedOrder) return
    if (!selectedOrder.username) {
      showToast('У пользователя нет Telegram username, свяжитесь по телефону'); return
    }
    const msg = buildContactMessage(selectedOrder)
    const url = `https://t.me/${selectedOrder.username}?text=${encodeURIComponent(msg)}`
    const tg = (window as any).Telegram?.WebApp
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(url)
    } else {
      window.open(url, '_blank')
    }
  }

  // ── 403 guard ──
  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center gap-6 px-8 text-center">
        <div className="w-16 h-16 rounded-[20px] bg-muted flex items-center justify-center">
          <HugeiconsIcon icon={CrownIcon} size={32} color="#9aa3ae" />
        </div>
        <div>
          <p className="text-[20px] font-bold text-foreground tracking-tighter mb-1">Доступ запрещён</p>
          <p className="text-[14px] font-medium text-muted-foreground">У вас нет прав администратора</p>
        </div>
        <motion.button onClick={onClose} whileTap={{ scale:0.96 }}
          className="h-12 px-8 rounded-[18px] bg-foreground text-background text-[15px] font-bold">
          Назад
        </motion.button>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════════════════════
  return (
    <div className="flex flex-col min-h-screen bg-background pb-8">

      {/* ── Top bar ── */}
      <motion.div
        initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
        className="flex items-center justify-between px-5 pt-6 pb-3"
      >
        <motion.button onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale:0.88 }} aria-label="Назад">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#09090b" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Админка</h1>
        {view === 'products' ? (
          <motion.button onClick={openAdd}
            className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center"
            whileTap={{ scale:0.88 }} aria-label="Добавить товар">
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#ffffff" />
          </motion.button>
        ) : view === 'promos' ? (
          <motion.button onClick={()=>setPromoFormOpen(true)}
            className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center"
            whileTap={{ scale:0.88 }} aria-label="Добавить промокод">
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#ffffff" />
          </motion.button>
        ) : view === 'slots' ? (
          <motion.button onClick={()=>setSlotFormOpen(true)}
            className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center"
            whileTap={{ scale:0.88 }} aria-label="Добавить слот">
            <HugeiconsIcon icon={PlusSignIcon} size={20} color="#ffffff" />
          </motion.button>
        ) : (
          <motion.button onClick={()=>{ setOrdersFetched(false) }}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            whileTap={{ scale:0.88 }} aria-label="Обновить заказы">
            <HugeiconsIcon icon={DeliveryBox01Icon} size={18} color="#09090b" />
          </motion.button>
        )}
      </motion.div>

      {/* ── Tab switcher ── */}
      <div className="px-5 pb-3">
        <div className="flex bg-muted rounded-[16px] p-1 gap-1">
          {(['products','orders','promos','slots'] as const).map(tab => (
            <motion.button
              key={tab}
              onClick={() => setView(tab)}
              className="flex-1 h-9 rounded-[12px] text-[13px] font-bold transition-colors"
              style={{
                background: view===tab ? '#09090b' : 'transparent',
                color: view===tab ? '#ffffff' : '#9aa3ae',
              }}
              whileTap={{ scale:0.97 }}
            >
              {tab==='products' ? 'Товары'
                : tab==='orders' ? 'Заказы'
                : tab==='promos' ? 'Промо'
                : 'Слоты'}
            </motion.button>
          ))}
        </div>
      </div>

      {/* ══════════ PRODUCTS VIEW ══════════ */}
      {view === 'products' && (
        <div className="px-5 flex flex-col gap-4">
          {/* Search */}
          <motion.div custom={0} variants={sv} initial="hidden" animate="visible"
            className="flex items-center gap-3 bg-muted rounded-[18px] px-4 h-12">
            <HugeiconsIcon icon={Search01Icon} size={18} color="#9aa3ae" />
            <input value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Поиск по названию или категории…"
              className="flex-1 bg-transparent text-[14px] font-medium text-foreground placeholder:text-muted-foreground outline-none" />
            {search && (
              <button onClick={()=>setSearch('')}>
                <HugeiconsIcon icon={Cancel01Icon} size={16} color="#9aa3ae" />
              </button>
            )}
          </motion.div>

          <span className="text-[13px] font-medium text-muted-foreground px-1">
            {prodLoading ? 'Загрузка…' : `${filteredProducts.length} из ${products.length} товаров`}
          </span>

          {prodLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-[20px] p-8 bg-muted flex flex-col items-center gap-3 text-center">
              <p className="text-[15px] font-bold text-foreground">Товаров не найдено</p>
              <p className="text-[13px] font-medium text-muted-foreground">Измените запрос или добавьте товар</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredProducts.map((product, i) => (
                <motion.div key={product.id} custom={i} variants={sv} initial="hidden" animate="visible"
                  className="flex items-center gap-3 rounded-[20px] p-4 bg-muted">
                  <div className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 bg-card">
                    {product.images[0]
                      ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><HugeiconsIcon icon={Package01Icon} size={20} color="#9aa3ae" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-foreground truncate">{product.name}</p>
                    <p className="text-[12px] font-medium text-muted-foreground mt-0.5">{product.category} · {product.stock} шт.</p>
                    <p className="text-[13px] font-bold mt-1" style={{ color:'#2e8b57' }}>
                      {product.price_discounted ?? product.price} ₽
                      {product.price_discounted && (
                        <span className="text-[11px] font-medium text-muted-foreground line-through ml-1.5">{product.price} ₽</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button onClick={()=>openEdit(product)} whileTap={{ scale:0.88 }}
                      className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center" aria-label="Редактировать">
                      <HugeiconsIcon icon={Edit01Icon} size={16} color="#09090b" />
                    </motion.button>
                    <motion.button onClick={()=>setDeleteTarget(product)} whileTap={{ scale:0.88 }}
                      className="w-9 h-9 rounded-[12px] flex items-center justify-center"
                      style={{ background:'rgba(239,68,68,0.10)' }} aria-label="Удалить">
                      <HugeiconsIcon icon={Delete01Icon} size={16} color="#ef4444" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════ ORDERS VIEW ══════════ */}
      {view === 'orders' && (
        <div className="px-5 flex flex-col gap-4">
          {/* Status filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(['all', ...ALL_STATUSES] as const).map(s => {
              const isAll = s === 'all'
              const active = statusFilter === s
              const accent = isAll ? '#09090b' : STATUS_COLOR[s as OrderStatus]
              // Для неактивного `pending` берём тёмный текст на светлом фоне (как у `all`) —
              // иначе серый текст на серой подложке сливается до нечитаемости.
              const inactiveText = (isAll || s === 'pending') ? '#09090b' : accent
              const inactiveBg   = (isAll || s === 'pending') ? 'rgba(9,9,11,0.08)' : STATUS_BG[s as OrderStatus]
              return (
                <motion.button key={s} onClick={()=>setStatusFilter(s)} whileTap={{ scale:0.94 }}
                  className="shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-full transition-all"
                  style={{
                    background: active ? accent : inactiveBg,
                    color: active ? '#fff' : inactiveText,
                    border: `1.5px solid ${active ? accent : 'transparent'}`,
                  }}>
                  {isAll ? 'Все' : STATUS_LABEL[s as OrderStatus]}
                </motion.button>
              )
            })}
          </div>

          <span className="text-[13px] font-medium text-muted-foreground px-1">
            {ordersLoading ? 'Загрузка…' : `${filteredOrders.length} заказов`}
          </span>

          {ordersLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="rounded-[20px] p-8 bg-muted flex flex-col items-center gap-3 text-center">
              <HugeiconsIcon icon={DeliveryBox01Icon} size={28} color="#9aa3ae" />
              <p className="text-[15px] font-bold text-foreground">Заказов нет</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredOrders.map((order, i) => {
                const userName = [order.first_name, order.last_name].filter(Boolean).join(' ')
                return (
                  <motion.button key={order.id} custom={i} variants={sv} initial="hidden" animate="visible"
                    onClick={()=>setSelectedOrder(order)} whileTap={{ scale:0.97 }}
                    className="w-full flex items-center gap-3 rounded-[20px] p-4 bg-muted text-left">
                    {/* User avatar */}
                    <div className="w-11 h-11 rounded-full shrink-0 overflow-hidden bg-card flex items-center justify-center"
                         style={{ background:'linear-gradient(135deg,#09090b,#27272a)' }}>
                      {order.user_photo
                        ? <img src={order.user_photo} alt={userName} className="w-full h-full object-cover" />
                        : <span className="text-white text-[16px] font-bold">
                            {order.first_name.charAt(0).toUpperCase()}
                          </span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-foreground">{userName}</span>
                        {order.username && (
                          <span className="text-[11px] font-medium text-muted-foreground truncate">@{order.username}</span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">
                        {order.items.map(i=>i.name.split(' ')[0]).join(', ')}
                      </p>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[12px] font-medium text-muted-foreground">
                          #{order.id} · {formatOrderDate(order.created_at)}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                              style={{ background:STATUS_BG[order.status], color:STATUS_COLOR[order.status] }}>
                          {STATUS_LABEL[order.status]}
                        </span>
                      </div>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════ PROMOS VIEW ══════════ */}
      {view === 'promos' && (
        <div className="px-5 flex flex-col gap-4">
          <span className="text-[13px] font-medium text-muted-foreground px-1">
            {promosLoading ? 'Загрузка…' : `${promos.length} промокодов`}
          </span>

          {promosLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : promos.length === 0 ? (
            <div className="rounded-[20px] p-8 bg-muted flex flex-col items-center gap-3 text-center">
              <HugeiconsIcon icon={DiscountTag01Icon} size={28} color="#9aa3ae" />
              <p className="text-[15px] font-bold text-foreground">Промокодов нет</p>
              <p className="text-[13px] font-medium text-muted-foreground">Нажмите + чтобы добавить</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {promos.map((promo, i) => {
                const st = getPromoStatus(promo)
                return (
                  <motion.div key={promo.id} custom={i} variants={sv} initial="hidden" animate="visible"
                    className="flex items-center gap-3 rounded-[20px] p-4 bg-muted">
                    <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                         style={{ background:'linear-gradient(135deg,#5a22c8,#7b3aed)' }}>
                      <HugeiconsIcon icon={DiscountTag01Icon} size={20} color="#ffffff" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[15px] font-bold text-foreground tracking-tighter">{promo.code}</p>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background:st.bg, color:st.color }}>{st.label}</span>
                      </div>
                      <p className="text-[13px] font-bold mt-0.5" style={{ color:'#2e8b57' }}>−{promo.discount_percent}%</p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-0.5">
                        {formatPromoDate(promo.active_from)} — {formatPromoDate(promo.active_to)}
                      </p>
                    </div>
                    <motion.button onClick={()=>setPromoDeleteTarget(promo)} whileTap={{ scale:0.88 }}
                      className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                      style={{ background:'rgba(239,68,68,0.10)' }} aria-label="Удалить промокод">
                      <HugeiconsIcon icon={Delete01Icon} size={16} color="#ef4444" />
                    </motion.button>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ══════════ SLOTS VIEW ══════════ */}
      {view === 'slots' && (
        <div className="px-5 flex flex-col gap-4">
          <span className="text-[13px] font-medium text-muted-foreground px-1">
            {slotsLoading ? 'Загрузка…' : `${slots.length} слотов доставки`}
          </span>

          {slotsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
            </div>
          ) : slots.length === 0 ? (
            <div className="rounded-[20px] p-8 bg-muted flex flex-col items-center gap-3 text-center">
              <HugeiconsIcon icon={Calendar03Icon} size={28} color="#9aa3ae" />
              <p className="text-[15px] font-bold text-foreground">Слотов нет</p>
              <p className="text-[13px] font-medium text-muted-foreground">Нажмите + чтобы добавить</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {(() => {
                // group by date
                const groups: Record<string, AdminDeliverySlot[]> = {}
                for (const s of slots) {
                  if (!groups[s.date]) groups[s.date] = []
                  groups[s.date].push(s)
                }
                const dates = Object.keys(groups).sort()
                return dates.map((date, di) => (
                  <motion.div key={date} custom={di} variants={sv} initial="hidden" animate="visible"
                    className="flex flex-col gap-2">
                    <p className="text-[13px] font-bold text-muted-foreground px-1 capitalize">
                      {formatFullSlotDate(date)}
                    </p>
                    <div className="flex flex-col gap-2">
                      {groups[date].map(slot => (
                        <div key={slot.id} className="flex items-center gap-3 rounded-[18px] p-4 bg-muted">
                          <div className="w-11 h-11 rounded-[14px] flex items-center justify-center shrink-0"
                               style={{ background: slot.available
                                 ? 'linear-gradient(135deg,#0b7a43,#2e8b57)'
                                 : 'linear-gradient(135deg,#a1a1aa,#71717a)' }}>
                            <HugeiconsIcon icon={Clock01Icon} size={20} color="#ffffff" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-[14px] font-bold text-foreground tracking-tighter">{slot.time_range}</p>
                              {!slot.available && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                                      style={{ background:'rgba(161,161,170,0.15)', color:'#71717a' }}>занято</span>
                              )}
                            </div>
                            <p className="text-[12px] font-medium text-muted-foreground mt-0.5 truncate">
                              {slot.districts.join(' · ')}
                            </p>
                          </div>
                          <motion.button onClick={()=>setSlotDeleteTarget(slot)} whileTap={{ scale:0.88 }}
                            className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                            style={{ background:'rgba(239,68,68,0.10)' }} aria-label="Удалить слот">
                            <HugeiconsIcon icon={Delete01Icon} size={16} color="#ef4444" />
                          </motion.button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              })()}
            </div>
          )}
        </div>
      )}

      {/* ══════════ ORDER DETAIL overlay ══════════ */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            key="order-detail"
            variants={overlayV}
            initial="hidden" animate="visible" exit="exit"
            transition={{ y:{ type:'spring', stiffness:300, damping:35 }, opacity:{ duration:0.2 } }}
            className="fixed inset-0 bg-background overflow-y-auto"
            style={{ zIndex:220 }}
          >
            {/* pb for contact button */}
            <div className="flex flex-col min-h-screen pb-[100px]">

              {/* Top bar */}
              <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.3 }}
                className="flex items-center justify-between px-5 pt-6 pb-4">
                <motion.button onClick={()=>setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
                  whileTap={{ scale:0.88 }} aria-label="Назад">
                  <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#09090b" />
                </motion.button>
                <h1 className="text-lg font-bold text-foreground tracking-tighter">Заказ #{selectedOrder.id}</h1>
                <div className="w-10 h-10" />
              </motion.div>

              <div className="px-5 flex flex-col gap-4">

                {/* Status hero */}
                <motion.div custom={0} variants={sv} initial="hidden" animate="visible"
                  className="rounded-[24px] p-5 relative overflow-hidden"
                  style={{ background:'linear-gradient(135deg,#09090b 0%,#27272a 100%)' }}>
                  <div className="absolute w-40 h-40 rounded-full pointer-events-none"
                       style={{ right:-50, top:-50, background:'radial-gradient(circle,rgba(255,255,255,0.08) 0%,transparent 72%)' }} />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
                           style={{ background:'rgba(255,255,255,0.10)' }}>
                        <HugeiconsIcon icon={DeliveryBox01Icon} size={24} color="#ffffff" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium" style={{ color:'rgba(255,255,255,0.65)' }}>
                          {formatOrderDate(selectedOrder.created_at)}
                        </p>
                        <p className="text-[20px] font-bold text-white tracking-tighter">{selectedOrder.total} ₽</p>
                      </div>
                    </div>
                    <span className="text-[12px] font-bold px-3 py-1.5 rounded-full"
                          style={{ background:STATUS_BG[selectedOrder.status], color:STATUS_COLOR[selectedOrder.status] }}>
                      {STATUS_LABEL[selectedOrder.status]}
                    </span>
                  </div>
                </motion.div>

                {/* User info */}
                <motion.section custom={1} variants={sv} initial="hidden" animate="visible"
                  className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={User02Icon} size={18} color="#2e8b57" />
                    </div>
                    <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Клиент</h2>
                  </div>
                  <div className="flex items-center gap-3 bg-card rounded-[16px] px-4 py-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                         style={{ background:'linear-gradient(135deg,#09090b,#27272a)' }}>
                      {selectedOrder.user_photo
                        ? <img src={selectedOrder.user_photo} alt="" className="w-full h-full object-cover" />
                        : <span className="text-white text-[14px] font-bold">
                            {selectedOrder.first_name.charAt(0).toUpperCase()}
                          </span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-foreground">
                        {[selectedOrder.first_name, selectedOrder.last_name].filter(Boolean).join(' ')}
                      </p>
                      {selectedOrder.username && (
                        <p className="text-[12px] font-medium text-muted-foreground">@{selectedOrder.username}</p>
                      )}
                    </div>
                  </div>
                  <InfoRow icon={SmartPhone01Icon} label="Телефон" value={selectedOrder.phone} />
                </motion.section>

                {/* Items */}
                <motion.section custom={2} variants={sv} initial="hidden" animate="visible"
                  className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={Package01Icon} size={18} color="#2e8b57" />
                    </div>
                    <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Состав</h2>
                  </div>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-card rounded-[16px] px-4 py-3">
                      <span className="text-[14px] font-bold text-foreground">{item.name}</span>
                      <div className="text-right">
                        <p className="text-[14px] font-bold text-foreground">{item.price * item.quantity} ₽</p>
                        <p className="text-[11px] font-medium text-muted-foreground">{item.quantity} шт. · {item.price} ₽</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between pt-2 border-t border-foreground/6">
                    <span className="text-[15px] font-bold text-foreground">Итого</span>
                    <span className="text-[15px] font-bold" style={{ color:'#2e8b57' }}>{selectedOrder.total} ₽</span>
                  </div>
                </motion.section>

                {/* Delivery info */}
                <motion.section custom={3} variants={sv} initial="hidden" animate="visible"
                  className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[12px] bg-card flex items-center justify-center shrink-0">
                      <HugeiconsIcon icon={Location01Icon} size={18} color="#2e8b57" />
                    </div>
                    <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Доставка</h2>
                  </div>
                  <InfoRow icon={Location01Icon} label="Адрес" value={selectedOrder.address} />
                  {selectedOrder.slot_date && selectedOrder.slot_time && (
                    <InfoRow icon={Clock01Icon} label="Слот"
                      value={`${formatSlotDate(selectedOrder.slot_date)} · ${selectedOrder.slot_time}`} />
                  )}
                  {selectedOrder.promo_code && (
                    <InfoRow icon={Package01Icon} label="Промокод" value={selectedOrder.promo_code} green />
                  )}
                </motion.section>

                {/* Status change */}
                <motion.section custom={4} variants={sv} initial="hidden" animate="visible"
                  className="rounded-[24px] p-5 bg-muted flex flex-col gap-3">
                  <h2 className="text-[18px] font-bold text-foreground tracking-tighter">Сменить статус</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {ALL_STATUSES.map(status => {
                      const isCurrent = selectedOrder.status === status
                      return (
                        <motion.button
                          key={status}
                          onClick={()=>handleStatusChange(status)}
                          disabled={isCurrent || updatingStatus}
                          whileTap={!isCurrent && !updatingStatus ? { scale:0.95 } : undefined}
                          className="py-2.5 px-2 rounded-[14px] text-[12px] font-bold transition-all text-center"
                          style={{
                            background: isCurrent ? STATUS_COLOR[status] : STATUS_BG[status],
                            color: isCurrent ? '#fff' : STATUS_COLOR[status],
                            opacity: updatingStatus && !isCurrent ? 0.5 : 1,
                          }}
                        >
                          {STATUS_LABEL[status]}
                        </motion.button>
                      )
                    })}
                  </div>
                </motion.section>

              </div>
            </div>

            {/* ── Contact button — pinned above bottom ── */}
            <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-3"
                 style={{ background:'linear-gradient(to top, var(--background) 70%, transparent)', zIndex:230 }}>
              <motion.button
                onClick={handleContact}
                whileTap={{ scale:0.97 }}
                className="w-full h-14 rounded-[20px] flex items-center justify-center gap-2.5"
                style={{ background:'linear-gradient(135deg,#229ED9,#1a7fb5)' }}
              >
                <HugeiconsIcon icon={TelegramIcon} size={22} color="#ffffff" />
                <span className="text-[15px] font-bold text-white">Написать клиенту</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirm ── */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-end justify-center pb-8 px-5"
            style={{ zIndex:240, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>setDeleteTarget(null)}>
            <motion.div
              initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ duration:0.28, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="w-full rounded-[24px] p-6 flex flex-col gap-4 bg-background">
              <div className="text-center">
                <p className="text-[18px] font-bold text-foreground tracking-tighter mb-1">Удалить товар?</p>
                <p className="text-[14px] font-medium text-muted-foreground">«{deleteTarget.name}» будет удалён безвозвратно</p>
              </div>
              <div className="flex gap-3">
                <motion.button onClick={()=>setDeleteTarget(null)} whileTap={{ scale:0.96 }}
                  className="flex-1 rounded-[18px] bg-muted text-foreground text-[15px] font-bold py-3.5">
                  Отмена
                </motion.button>
                <motion.button onClick={handleDelete} disabled={deleting}
                  whileTap={!deleting ? { scale:0.96 } : undefined}
                  className="flex-1 rounded-[18px] text-white text-[15px] font-bold py-3.5"
                  style={{ background: deleting ? '#fca5a5' : '#ef4444' }}>
                  {deleting ? 'Удаляю…' : 'Удалить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Promo delete confirm ── */}
      <AnimatePresence>
        {promoDeleteTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-end justify-center pb-8 px-5"
            style={{ zIndex:240, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>!deletingPromo&&setPromoDeleteTarget(null)}>
            <motion.div
              initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ duration:0.28, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="w-full rounded-[24px] p-6 flex flex-col gap-4 bg-background">
              <div className="text-center">
                <p className="text-[18px] font-bold text-foreground tracking-tighter mb-1">Удалить промокод?</p>
                <p className="text-[14px] font-medium text-muted-foreground">«{promoDeleteTarget.code}» будет удалён безвозвратно</p>
              </div>
              <div className="flex gap-3">
                <motion.button onClick={()=>setPromoDeleteTarget(null)} disabled={deletingPromo}
                  whileTap={!deletingPromo?{scale:0.96}:undefined}
                  className="flex-1 rounded-[18px] bg-muted text-foreground text-[15px] font-bold py-3.5">
                  Отмена
                </motion.button>
                <motion.button onClick={handleDeletePromo} disabled={deletingPromo}
                  whileTap={!deletingPromo?{scale:0.96}:undefined}
                  className="flex-1 rounded-[18px] text-white text-[15px] font-bold py-3.5"
                  style={{ background: deletingPromo ? '#fca5a5' : '#ef4444' }}>
                  {deletingPromo ? 'Удаляю…' : 'Удалить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Promo form sheet ── */}
      <AnimatePresence>
        {promoFormOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0" style={{ zIndex:250, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>!savingPromo&&setPromoFormOpen(false)}>
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ duration:0.35, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background overflow-y-auto"
              style={{ maxHeight:'92vh' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[20px] font-bold text-foreground tracking-tighter">Новый промокод</h2>
                <motion.button onClick={()=>!savingPromo&&setPromoFormOpen(false)} whileTap={{ scale:0.88 }}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} color="#09090b" />
                </motion.button>
              </div>
              <div className="px-5 pb-8 flex flex-col gap-3">
                <FormField label="Код промокода *" value={promoForm.code}
                  onChange={v=>setPromoForm(f=>({...f,code:v.toUpperCase()}))} placeholder="SUMMER25" />
                <FormField label="Скидка (%) *" value={promoForm.discount_percent} type="number"
                  onChange={v=>setPromoForm(f=>({...f,discount_percent:v}))} placeholder="15" />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <FormField label="Дата начала *" value={promoForm.active_from} type="date"
                      onChange={v=>setPromoForm(f=>({...f,active_from:v}))} placeholder="" />
                  </div>
                  <div className="flex-1">
                    <FormField label="Дата конца *" value={promoForm.active_to} type="date"
                      onChange={v=>setPromoForm(f=>({...f,active_to:v}))} placeholder="" />
                  </div>
                </div>
                <motion.button onClick={handleSavePromo} disabled={savingPromo}
                  whileTap={!savingPromo?{scale:0.97}:undefined}
                  className="h-14 rounded-[20px] flex items-center justify-center mt-2"
                  style={{ background: savingPromo ? '#e4e4e7' : '#09090b' }}>
                  {savingPromo
                    ? <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                    : <span className="text-[15px] font-bold text-white">Создать промокод</span>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slot delete confirm ── */}
      <AnimatePresence>
        {slotDeleteTarget && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 flex items-end justify-center pb-8 px-5"
            style={{ zIndex:240, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>!deletingSlot&&setSlotDeleteTarget(null)}>
            <motion.div
              initial={{ y:60, opacity:0 }} animate={{ y:0, opacity:1 }} exit={{ y:60, opacity:0 }}
              transition={{ duration:0.28, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="w-full rounded-[24px] p-6 flex flex-col gap-4 bg-background">
              <div className="text-center">
                <p className="text-[18px] font-bold text-foreground tracking-tighter mb-1">Удалить слот?</p>
                <p className="text-[14px] font-medium text-muted-foreground">
                  «{formatFullSlotDate(slotDeleteTarget.date)} · {slotDeleteTarget.time_range}» будет удалён
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button onClick={()=>setSlotDeleteTarget(null)} disabled={deletingSlot}
                  whileTap={!deletingSlot?{scale:0.96}:undefined}
                  className="flex-1 rounded-[18px] bg-muted text-foreground text-[15px] font-bold py-3.5">
                  Отмена
                </motion.button>
                <motion.button onClick={handleDeleteSlot} disabled={deletingSlot}
                  whileTap={!deletingSlot?{scale:0.96}:undefined}
                  className="flex-1 rounded-[18px] text-white text-[15px] font-bold py-3.5"
                  style={{ background: deletingSlot ? '#fca5a5' : '#ef4444' }}>
                  {deletingSlot ? 'Удаляю…' : 'Удалить'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Slot form sheet ── */}
      <AnimatePresence>
        {slotFormOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0" style={{ zIndex:250, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>!savingSlot&&setSlotFormOpen(false)}>
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ duration:0.35, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background overflow-y-auto"
              style={{ maxHeight:'92vh' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[20px] font-bold text-foreground tracking-tighter">Новый слот доставки</h2>
                <motion.button onClick={()=>!savingSlot&&setSlotFormOpen(false)} whileTap={{ scale:0.88 }}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} color="#09090b" />
                </motion.button>
              </div>
              <div className="px-5 pb-8 flex flex-col gap-3">
                <FormField label="Дата *" value={slotForm.date} type="date"
                  onChange={v=>setSlotForm(f=>({...f,date:v}))} placeholder="" />
                <FormField label="Время *" value={slotForm.time_range}
                  onChange={v=>setSlotForm(f=>({...f,time_range:v}))} placeholder="09:00 — 12:00" />
                <FormField label="Районы (через запятую) *" value={slotForm.districts}
                  onChange={v=>setSlotForm(f=>({...f,districts:v}))} placeholder="Центр, Первомайский, Октябрьский" />
                <p className="text-[12px] font-medium text-muted-foreground px-1">
                  Слот станет доступен пользователям при оформлении заказа.
                </p>
                <motion.button onClick={handleSaveSlot} disabled={savingSlot}
                  whileTap={!savingSlot?{scale:0.97}:undefined}
                  className="h-14 rounded-[20px] flex items-center justify-center mt-2"
                  style={{ background: savingSlot ? '#e4e4e7' : '#09090b' }}>
                  {savingSlot
                    ? <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                    : <span className="text-[15px] font-bold text-white">Создать слот</span>}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Product form sheet ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0" style={{ zIndex:250, background:'rgba(0,0,0,0.45)' }}
            onClick={()=>!saving && !justAdded && setFormOpen(false)}>
            <motion.div
              initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
              transition={{ duration:0.35, ease:[0.25,0.46,0.45,0.94] }}
              onClick={e=>e.stopPropagation()}
              className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-background overflow-y-auto"
              style={{ maxHeight:'92vh' }}>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-[20px] font-bold text-foreground tracking-tighter">
                  {editProduct ? 'Редактировать товар' : 'Новый товар'}
                </h2>
                <motion.button onClick={()=>!saving && !justAdded && setFormOpen(false)} whileTap={{ scale:0.88 }}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                  <HugeiconsIcon icon={Cancel01Icon} size={18} color="#09090b" />
                </motion.button>
              </div>
              <div className="px-5 pb-8 flex flex-col gap-3">
                <FormField label="Название *" value={form.name} onChange={v=>setForm(f=>({...f,name:v}))} placeholder="Авокадо Хасс" />
                <div className="flex gap-3">
                  <div className="flex-1"><FormField label="Цена (₽) *" value={form.price} type="number" onChange={v=>setForm(f=>({...f,price:v}))} placeholder="350" /></div>
                  <div className="flex-1"><FormField label="Цена со скидкой" value={form.price_discounted} type="number" onChange={v=>setForm(f=>({...f,price_discounted:v}))} placeholder="280" /></div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1"><FormField label="Вес/объём *" value={form.weight} onChange={v=>setForm(f=>({...f,weight:v}))} placeholder="1 кг" /></div>
                  <div className="flex-1"><FormField label="Остаток (шт.) *" value={form.stock} type="number" onChange={v=>setForm(f=>({...f,stock:v}))} placeholder="50" /></div>
                </div>
                <FormField label="Категория *" value={form.category} onChange={v=>setForm(f=>({...f,category:v}))} placeholder="Овощи" />
                <ImagesField
                  value={form.images.split('\n').map(s=>s.trim()).filter(Boolean)}
                  onChange={arr=>setForm(f=>({...f,images:arr.join('\n')}))}
                />
                <FormField label="Происхождение" value={form.origin} onChange={v=>setForm(f=>({...f,origin:v}))} placeholder="Россия, Краснодарский край" />
                <FormField label="Теги (через запятую)" value={form.tags} onChange={v=>setForm(f=>({...f,tags:v}))} placeholder="органик, фермерское" />
                <FormField label="Описание" value={form.description} multiline onChange={v=>setForm(f=>({...f,description:v}))} placeholder="Подробное описание…" />
                <p className="text-[13px] font-bold text-muted-foreground mt-1">Пищевая ценность (на 100г)</p>
                <div className="flex gap-3">
                  <div className="flex-1"><FormField label="Калории" value={form.calories} type="number" onChange={v=>setForm(f=>({...f,calories:v}))} placeholder="52" /></div>
                  <div className="flex-1"><FormField label="Углеводы" value={form.carbs} type="number" onChange={v=>setForm(f=>({...f,carbs:v}))} placeholder="6" /></div>
                  <div className="flex-1"><FormField label="Жиры" value={form.fats} type="number" onChange={v=>setForm(f=>({...f,fats:v}))} placeholder="15" /></div>
                </div>
                <FormField label="Спелость" value={form.ripeness} onChange={v=>setForm(f=>({...f,ripeness:v}))} placeholder="Спелый, готов к употреблению" />
                <motion.button onClick={handleSave} disabled={saving || justAdded}
                  whileTap={!saving && !justAdded ? {scale:0.97} : undefined}
                  className="h-14 rounded-[20px] flex items-center justify-center mt-2 transition-colors"
                  style={{
                    background: justAdded ? '#2e8b57'
                              : saving    ? '#e4e4e7'
                                          : '#09090b',
                  }}>
                  {saving ? (
                    <div className="w-5 h-5 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                  ) : justAdded ? (
                    <span className="text-[15px] font-bold text-white">Товар добавлен</span>
                  ) : (
                    <span className="text-[15px] font-bold text-white">
                      {editProduct ? 'Сохранить изменения' : 'Добавить товар'}
                    </span>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Toast ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
            className="fixed left-5 right-5 text-center py-3.5 rounded-[16px] text-[14px] font-bold text-white"
            style={{ bottom:'90px', zIndex:300, background:'#09090b' }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, green }: { icon:any; label:string; value:string; green?:boolean }) {
  return (
    <div className="flex items-center gap-3 bg-card rounded-[16px] px-4 py-3">
      <HugeiconsIcon icon={icon} size={16} color="#9aa3ae" />
      <span className="text-[13px] font-medium text-muted-foreground w-20 shrink-0">{label}</span>
      <span className="text-[14px] font-bold flex-1 min-w-0 truncate"
            style={{ color: green ? '#2e8b57' : '#09090b' }}>{value}</span>
    </div>
  )
}

function ImagesField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const [validity, setValidity] = useState<Record<string, 'ok'|'err'|'loading'>>({})
  const [draftError, setDraftError] = useState<string|null>(null)

  // Probe each URL once
  useEffect(() => {
    for (const url of value) {
      if (validity[url]) continue
      setValidity(v => ({ ...v, [url]: 'loading' }))
      const img = new Image()
      img.onload = () => setValidity(v => ({ ...v, [url]: 'ok' }))
      img.onerror = () => setValidity(v => ({ ...v, [url]: 'err' }))
      img.src = url
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const isLikelyUrl = (s: string) => /^https?:\/\/.+\..+/i.test(s.trim())

  const handleAdd = () => {
    const url = draft.trim()
    if (!url) return
    if (!isLikelyUrl(url)) { setDraftError('Введите корректный URL (http/https)'); return }
    if (value.includes(url)) { setDraftError('Этот URL уже добавлен'); return }
    onChange([...value, url])
    setDraft('')
    setDraftError(null)
  }

  const handleRemove = (url: string) => {
    onChange(value.filter(u => u !== url))
    setValidity(v => { const next = { ...v }; delete next[url]; return next })
  }

  const handleMove = (url: string, dir: -1 | 1) => {
    const idx = value.indexOf(url)
    if (idx < 0) return
    const next = [...value]
    const swap = idx + dir
    if (swap < 0 || swap >= next.length) return
    ;[next[idx], next[swap]] = [next[swap], next[idx]]
    onChange(next)
  }

  const base = "w-full bg-muted rounded-[16px] px-4 text-[14px] font-medium text-foreground placeholder:text-muted-foreground outline-none"

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-muted-foreground px-1">
        Изображения {value.length > 0 && <span className="text-muted-foreground/70 font-medium">· {value.length}</span>}
      </label>

      {value.length > 0 && (
        <div className="flex flex-col gap-2">
          {value.map((url, idx) => {
            const status = validity[url]
            return (
              <div key={url} className="flex items-center gap-3 bg-muted rounded-[16px] p-2">
                <div className="w-12 h-12 rounded-[12px] overflow-hidden shrink-0 bg-card flex items-center justify-center relative">
                  {status === 'err' ? (
                    <HugeiconsIcon icon={Cancel01Icon} size={18} color="#ef4444" />
                  ) : status === 'loading' || !status ? (
                    <div className="w-4 h-4 rounded-full border-2 border-foreground/20 border-t-foreground animate-spin" />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                  {idx === 0 && (
                    <span className="absolute top-0.5 left-0.5 text-[8px] font-bold px-1 py-0.5 rounded leading-none"
                          style={{ background:'#09090b', color:'#fff' }}>1</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-foreground truncate" title={url}>{url}</p>
                  <p className="text-[11px] font-medium mt-0.5"
                     style={{ color: status === 'err' ? '#ef4444' : status === 'ok' ? '#2e8b57' : '#9aa3ae' }}>
                    {status === 'err' ? 'Не удалось загрузить' : status === 'ok' ? 'OK' : 'Проверка…'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {value.length > 1 && (
                    <>
                      <button type="button" onClick={()=>handleMove(url,-1)} disabled={idx===0}
                        className="w-7 h-7 rounded-[10px] bg-card flex items-center justify-center disabled:opacity-30"
                        aria-label="Вверх">
                        <span className="text-[12px] font-bold leading-none">↑</span>
                      </button>
                      <button type="button" onClick={()=>handleMove(url,1)} disabled={idx===value.length-1}
                        className="w-7 h-7 rounded-[10px] bg-card flex items-center justify-center disabled:opacity-30"
                        aria-label="Вниз">
                        <span className="text-[12px] font-bold leading-none">↓</span>
                      </button>
                    </>
                  )}
                  <button type="button" onClick={()=>handleRemove(url)}
                    className="w-7 h-7 rounded-[10px] flex items-center justify-center"
                    style={{ background:'rgba(239,68,68,0.10)' }} aria-label="Удалить">
                    <HugeiconsIcon icon={Cancel01Icon} size={12} color="#ef4444" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2 mt-1">
        <input
          value={draft}
          onChange={e=>{ setDraft(e.target.value); if (draftError) setDraftError(null) }}
          onKeyDown={e=>{ if (e.key==='Enter') { e.preventDefault(); handleAdd() } }}
          placeholder="https://example.com/image.jpg"
          className={`${base} h-11 flex-1`}
        />
        <button type="button" onClick={handleAdd}
          className="h-11 px-4 rounded-[16px] bg-foreground text-white text-[13px] font-bold flex items-center gap-1.5">
          <HugeiconsIcon icon={PlusSignIcon} size={14} color="#ffffff" />
          Добавить
        </button>
      </div>
      {draftError && <p className="text-[11px] font-medium px-1" style={{ color:'#ef4444' }}>{draftError}</p>}
      {value.length === 0 && !draftError && (
        <p className="text-[11px] font-medium text-muted-foreground px-1">
          Первое изображение будет главным. Поддерживаются прямые URL на картинки (jpg/png/webp).
        </p>
      )}
    </div>
  )
}

function FormField({ label, value, onChange, placeholder, type='text', multiline=false }:
  { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; multiline?:boolean }) {
  const base = "w-full bg-muted rounded-[16px] px-4 text-[14px] font-medium text-foreground placeholder:text-muted-foreground outline-none"
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-bold text-muted-foreground px-1">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            rows={3} className={`${base} py-3 resize-none`} />
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
            className={`${base} h-11`} />}
    </div>
  )
}
