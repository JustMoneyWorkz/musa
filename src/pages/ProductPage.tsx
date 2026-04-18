import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Bookmark02Icon,
  Share01Icon,
  ArrowLeft01Icon,
  ShoppingBasket01Icon,
  MinusSignIcon,
  PlusSignIcon,
  StarIcon,
  DeliveryBox01Icon,
  Location01Icon,
  Tick01Icon,
} from '@hugeicons/core-free-icons'
import { Product } from '../components/ProductCard'

interface ProductPageProps {
  product: Product
  onClose: () => void
  onAddToCart: (id: string, qty?: number) => void
  onToggleFavorite?: (id: string) => void
  favoriteIds?: string[]
  cartQty?: Record<string, number>
}

const NUTRITION = [
  { value: '41 ккал', label: 'Калории' },
  { value: '0.4 г',   label: 'Жиры' },
  { value: '2.4 г',   label: 'Клетчатка' },
  { value: 'Спелый',  label: 'Зрелость' },
]

export default function ProductPage({ product, onClose, onAddToCart, onToggleFavorite, favoriteIds = [], cartQty = {} }: ProductPageProps) {
  const isFavorite = favoriteIds.includes(product.id)
  const inCartQty = cartQty[product.id] ?? 0
  const isInCart = inCartQty > 0
  const isOutOfStock = product.inStock === false
  const disabled = isOutOfStock || isInCart
  const [qty, setQty] = useState(1)
  const images = product.images?.length ? product.images : [product.imageSrc]
  const [imgIndex, setImgIndex] = useState(0)
  const imgIndexRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef(0)

  const snapTo = (index: number) => {
    const w = containerRef.current?.offsetWidth ?? 300
    const el = stripRef.current
    if (!el) return
    el.style.transition = 'transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
    el.style.transform = `translateX(${-index * w}px)`
  }

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    if (stripRef.current) stripRef.current.style.transition = 'none'
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current
    const w = containerRef.current?.offsetWidth ?? 300
    const idx = imgIndexRef.current
    const offset = (idx === 0 && dx > 0) || (idx === images.length - 1 && dx < 0)
      ? dx * 0.25
      : dx
    if (stripRef.current)
      stripRef.current.style.transform = `translateX(${-idx * w + offset}px)`
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const idx = imgIndexRef.current
    let next = idx
    if (dx < -50 && idx < images.length - 1) next = idx + 1
    else if (dx > 50 && idx > 0) next = idx - 1
    imgIndexRef.current = next
    setImgIndex(next)
    snapTo(next)
  }

  const weightShort = product.weight.split('·')[0].trim()

  const toggleFavorite = () => onToggleFavorite?.(product.id)

  const increment = () => setQty(q => q + 1)
  const decrement = () => setQty(q => Math.max(1, q - 1))

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
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Товар</h1>
        <motion.button
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Поделиться"
        >
          <HugeiconsIcon icon={Share01Icon} size={18} color="#09090b" />
        </motion.button>
      </motion.div>

      <div className="px-5 flex flex-col gap-4">

        {/* Hero card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-[28px] p-5 flex flex-col gap-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' }}
        >
          <div
            className="absolute w-44 h-44 rounded-full pointer-events-none"
            style={{ right: -52, top: -60, background: 'radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 72%)' }}
          />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>Сегодня утром собрано</p>
              <h2 className="text-2xl font-bold text-white tracking-tighter max-w-[180px] leading-tight">{product.title}</h2>
              <p className="text-[14px] font-medium mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>{product.weight}</p>
            </div>
            <motion.button
              onClick={toggleFavorite}
              className="w-12 h-12 rounded-[16px] flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.10)' }}
              whileTap={{ scale: 0.84 }}
              aria-label="В избранное"
            >
              <motion.div
                animate={{ scale: isFavorite ? [1, 1.28, 1] : 1 }}
                transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  size={20}
                  color={isFavorite ? '#f06b6b' : 'rgba(255,255,255,0.80)'}
                  strokeWidth={isFavorite ? 0 : 1.8}
                  style={{ fill: isFavorite ? '#f06b6b' : 'none', transition: 'fill 0.22s ease, color 0.22s ease' }}
                />
              </motion.div>
            </motion.button>
          </div>

          <div
            ref={containerRef}
            className="w-full h-[188px] rounded-2xl relative z-10 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div
              ref={stripRef}
              className="flex h-full"
              style={{ width: `${images.length * 100}%`, willChange: 'transform' }}
            >
              {images.map((src, i) => (
                <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / images.length}%` }}>
                  <img src={src} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" draggable={false} />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 relative z-10">
            {[
              { icon: StarIcon,          value: '4.9',       label: 'Рейтинг' },
              { icon: DeliveryBox01Icon, value: weightShort, label: 'Вес' },
              { icon: Location01Icon,    value: 'Своя',      label: 'Ферма' },
            ].map(({ icon, value, label }) => (
              <div key={label} className="rounded-2xl py-3 px-2 text-center flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.10)' }}>
                <HugeiconsIcon icon={icon} size={14} color="rgba(255,255,255,0.72)" />
                <p className="text-[13px] font-bold text-white leading-tight mt-1 w-full truncate text-center">{value}</p>
                <p className="text-[11px] font-medium mt-0.5 w-full truncate text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Info card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12 }}
          className="rounded-[28px] p-5 bg-muted flex flex-col gap-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-[22px] font-bold text-foreground tracking-tighter leading-tight">{product.title}</h3>
              <p className="text-[14px] font-medium text-muted-foreground mt-1">{product.weight} · свежие</p>
            </div>
            <div className="bg-card rounded-[16px] px-4 py-2.5 shrink-0">
              <p className="text-[18px] font-bold leading-none" style={{ color: '#2e8b57' }}>{product.price} ₽</p>
              {product.oldPrice && (
                <p className="text-[12px] line-through text-muted-foreground mt-0.5 text-center">{product.oldPrice} ₽</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-full" style={{ background: 'rgba(46,139,87,0.12)', color: '#2e8b57' }}>
              Бестселлер
            </span>
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-card text-foreground">Витамин C</span>
            <span className="text-[12px] font-bold px-3 py-1.5 rounded-full bg-card text-foreground">Органик</span>
          </div>

          <p className="text-[14px] leading-relaxed text-muted-foreground">
            Свежие продукты с фермерских хозяйств, выращенные без применения химических удобрений. Идеально подходят для здорового питания, смузи и приготовления вкусных блюд.
          </p>

          <div className="grid grid-cols-2 gap-2">
            {NUTRITION.map((n) => (
              <div key={n.label} className="bg-card rounded-[16px] px-4 py-3 flex flex-col gap-0.5">
                <p className="text-[15px] font-bold text-foreground">{n.value}</p>
                <p className="text-[12px] font-medium text-muted-foreground">{n.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Cart panel */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.22 }}
          className="rounded-[28px] p-5 bg-muted flex flex-col gap-4"
        >
          <div>
            <h2 className="text-[22px] font-bold text-foreground tracking-tighter">В корзину</h2>
            <p className="text-[15px] font-medium text-muted-foreground mt-1">Выберите количество товара</p>
          </div>

          <div className="bg-card rounded-[20px] px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <HugeiconsIcon icon={ShoppingBasket01Icon} size={20} color="#2e8b57" />
              <p className="text-[15px] font-bold text-foreground">Количество</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-muted px-1 py-1">
              <motion.button
                onClick={decrement}
                className="w-8 h-8 rounded-full bg-card flex items-center justify-center"
                whileTap={{ scale: 0.82 }}
                aria-label="Уменьшить"
              >
                <HugeiconsIcon icon={MinusSignIcon} size={14} color="#09090b" strokeWidth={2.5} />
              </motion.button>
              <span className="min-w-[22px] text-center text-[15px] font-bold text-foreground">{qty}</span>
              <motion.button
                onClick={increment}
                className="w-8 h-8 rounded-full bg-card flex items-center justify-center"
                whileTap={{ scale: 0.82 }}
                aria-label="Увеличить"
              >
                <HugeiconsIcon icon={PlusSignIcon} size={14} color="#09090b" strokeWidth={2.5} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[15px] font-medium text-muted-foreground">Цена за штуку</span>
            <span className="text-[15px] font-bold text-foreground">{product.price} ₽</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-muted-foreground/10">
            <span className="text-[15px] font-bold text-foreground">Выбрано {qty} шт.</span>
            <span className="text-[15px] font-bold" style={{ color: '#2e8b57' }}>{product.price * qty} ₽</span>
          </div>

          <motion.button
            onClick={() => { if (disabled) return; onAddToCart(product.id, qty) }}
            whileTap={!disabled ? { scale: 0.97 } : undefined}
            className="h-14 rounded-[20px] flex items-center justify-between px-5 w-full relative overflow-hidden"
            style={{
              background: isOutOfStock ? '#e4e4e7' : isInCart ? '#2e8b57' : '#09090b',
            }}
          >
            <span className="text-base font-bold flex items-center gap-2" style={{ color: isOutOfStock ? '#a1a1aa' : '#ffffff' }}>
              {isInCart && <HugeiconsIcon icon={Tick01Icon} size={18} color="#ffffff" strokeWidth={2.8} />}
              {isOutOfStock ? 'Нет в наличии' : isInCart ? `В корзине · ${inCartQty} шт.` : 'Добавить в корзину'}
            </span>
            {!isOutOfStock && !isInCart && (
              <span className="rounded-2xl px-3 py-2.5 text-[14px] font-bold text-white leading-none" style={{ background: 'rgba(255,255,255,0.12)' }}>
                {product.price * qty} ₽
              </span>
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 rounded-[20px] pointer-events-none" style={{ background: 'rgba(255,255,255,0.35)' }} />
            )}
          </motion.button>
        </motion.section>

      </div>
    </div>
  )
}
