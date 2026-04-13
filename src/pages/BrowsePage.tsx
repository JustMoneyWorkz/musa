import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Location01Icon,
  ShoppingBag01Icon,
  Search01Icon,
  FilterHorizontalIcon,
  Cancel01Icon,
  PlusSignIcon,
} from '@hugeicons/core-free-icons'
import { Product } from '../components/ProductCard'

const CATEGORIES = ['Все', 'Овощи', 'Наборы']
const FILTER_CATS = ['Овощи', 'Наборы']

interface BrowsePageProps {
  products: Product[]
  onAddToCart: (id: string) => void
  onProductClick: (product: Product) => void
  initialCategory?: string
  cartQty?: Record<string, number>
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function BrowsePage({ products, onAddToCart, onProductClick, initialCategory, cartQty = {} }: BrowsePageProps) {
  const initialIndex = initialCategory ? Math.max(0, CATEGORIES.indexOf(initialCategory)) : 0
  const [activeCategory, setActiveCategory] = useState(initialIndex)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAdd = (e: React.MouseEvent, id: string, inStock?: boolean) => {
    e.stopPropagation()
    if (inStock === false || (cartQty[id] ?? 0) > 0) return
    onAddToCart(id)
  }

  const [isFilterOpen, setIsFilterOpen] = useState(false)
  // Pending (while sheet open)
  const [pendingSort, setPendingSort] = useState<'asc' | 'desc' | null>(null)
  const [pendingCats, setPendingCats] = useState<string[]>([])
  const [pendingInStock, setPendingInStock] = useState(false)
  // Applied
  const [appliedSort, setAppliedSort] = useState<'asc' | 'desc' | null>(null)
  const [appliedCats, setAppliedCats] = useState<string[]>([])
  const [appliedInStock, setAppliedInStock] = useState(false)

  const activeFiltersCount =
    (appliedSort ? 1 : 0) + appliedCats.length + (appliedInStock ? 1 : 0)

  const openFilter = () => {
    setPendingSort(appliedSort)
    setPendingCats([...appliedCats])
    setPendingInStock(appliedInStock)
    setIsFilterOpen(true)
  }

  const applyFilter = () => {
    setAppliedSort(pendingSort)
    setAppliedCats([...pendingCats])
    setAppliedInStock(pendingInStock)
    setIsFilterOpen(false)
  }

  const resetFilter = () => {
    setPendingSort(null)
    setPendingCats([])
    setPendingInStock(false)
  }

  const togglePendingCat = (cat: string) => {
    setPendingCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  // ── Filtering pipeline ──────────────────────────────────────────────────────
  const byPill =
    activeCategory === 0
      ? products
      : products.filter((p) => p.category === CATEGORIES[activeCategory])

  const bySheetCats =
    appliedCats.length > 0
      ? byPill.filter((p) => appliedCats.includes(p.category ?? ''))
      : byPill

  const byStock = appliedInStock
    ? bySheetCats.filter((p) => p.inStock !== false)
    : bySheetCats

  const bySearch = searchQuery.trim()
    ? byStock.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : byStock

  const filteredProducts =
    appliedSort === 'asc'
      ? [...bySearch].sort((a, b) => a.price - b.price)
      : appliedSort === 'desc'
      ? [...bySearch].sort((a, b) => b.price - a.price)
      : bySearch

  const openSearch = () => setIsSearchOpen(true)
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const pageTitle =
    initialCategory && activeCategory !== 0
      ? CATEGORIES[activeCategory]
      : 'Все продукты'

  return (
    <div className="flex flex-col min-h-screen pb-[110px]">
      <div className="px-5 flex flex-col gap-5 pt-6">

        {/* Topbar */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <p className="text-[13px] font-medium text-muted-foreground">Доставка в</p>
            <div className="flex items-center gap-2 min-w-0">
              <HugeiconsIcon icon={Location01Icon} size={16} color="#2e8b57" />
              <p className="text-[18px] font-bold text-foreground truncate tracking-tighter">Зелёный район</p>
            </div>
          </div>
          <motion.button
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0"
            whileTap={{ scale: 0.88 }}
            aria-label="Корзина"
          >
            <HugeiconsIcon icon={ShoppingBag01Icon} size={22} color="#09090b" />
          </motion.button>
        </motion.div>

        {/* Page title */}
        <AnimatePresence>
          {!isSearchOpen && (
            <motion.div
              key="page-title"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="overflow-hidden"
            >
              <h1 className="text-[30px] font-bold text-foreground tracking-tighter leading-tight">{pageTitle}</h1>
              <p className="text-[14px] font-medium text-muted-foreground mt-1">Овощи, фрукты, зелень и ежедневные товары</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search row */}
        <div className="flex items-center gap-3">
          <motion.div
            layout
            onClick={!isSearchOpen ? openSearch : undefined}
            className="flex-1 flex items-center gap-3 h-14 rounded-[24px] bg-muted overflow-hidden cursor-pointer"
            style={{ paddingLeft: 16, paddingRight: isSearchOpen ? 8 : 16 }}
          >
            <HugeiconsIcon icon={Search01Icon} size={20} color={isSearchOpen ? '#2e8b57' : '#9aa3ae'} />

            <AnimatePresence mode="wait" initial={false}>
              {isSearchOpen ? (
                <motion.input
                  key="input"
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  transition={{ duration: 0.18 }}
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={closeSearch}
                  onClick={(e) => e.stopPropagation()}
                  placeholder="Введите название..."
                  className="flex-1 bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
                />
              ) : (
                <motion.span
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 text-[15px] font-medium text-muted-foreground truncate"
                >
                  Поиск фруктов, овощей...
                </motion.span>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isSearchOpen && (
                <motion.button
                  key="clear-btn"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  onClick={(e) => { e.stopPropagation(); closeSearch() }}
                  className="w-9 h-9 flex items-center justify-center shrink-0"
                  whileTap={{ scale: 0.85 }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} color="#9aa3ae" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>

          <AnimatePresence>
            {!isSearchOpen && (
              <motion.button
                key="filter-btn"
                initial={{ opacity: 0, scale: 0.7, width: 0 }}
                animate={{ opacity: 1, scale: 1, width: 56 }}
                exit={{ opacity: 0, scale: 0.7, width: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                onClick={openFilter}
                className="h-14 rounded-[24px] flex items-center justify-center shrink-0 overflow-hidden relative"
                style={{ background: activeFiltersCount > 0 ? '#2e8b57' : '#09090b' }}
                whileTap={{ scale: 0.88 }}
                aria-label="Фильтры"
              >
                <HugeiconsIcon icon={FilterHorizontalIcon} size={22} color="#ffffff" />
                {activeFiltersCount > 0 && (
                  <span className="absolute top-2 right-1.5 min-w-[16px] h-[16px] bg-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none" style={{ color: '#2e8b57' }}>
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Category pills */}
        <AnimatePresence>
          {!isSearchOpen && (
            <motion.div
              key="cat-pills"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: 'none' }}>
                {CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat}
                    onClick={() => setActiveCategory(i)}
                    className="h-10 px-4 rounded-[20px] text-[14px] font-bold shrink-0"
                    style={
                      i === activeCategory
                        ? { background: '#2e8b57', color: '#ffffff' }
                        : { background: 'var(--muted)', color: 'var(--foreground)' }
                    }
                    whileTap={{ scale: 0.94 }}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section head */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-foreground tracking-tighter">
              {isSearchOpen && searchQuery ? `Результаты: «${searchQuery}»` : 'Популярное на неделе'}
            </h2>
            <p className="text-[14px] font-medium text-muted-foreground mt-1">
              {isSearchOpen && searchQuery
                ? `Найдено ${filteredProducts.length} товар${filteredProducts.length === 1 ? '' : filteredProducts.length < 5 ? 'а' : 'ов'}`
                : 'Лучшие товары с рынка'}
            </p>
          </div>
          {!isSearchOpen && (
            <button className="text-[14px] font-bold shrink-0" style={{ color: '#2e8b57' }}>Все</button>
          )}
        </div>

        {/* Product grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={searchQuery + activeCategory}
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
          >
            {filteredProducts.length === 0 ? (
              <motion.div
                variants={cardVariants}
                className="col-span-2 flex flex-col items-center justify-center py-16 gap-3"
              >
                <p className="text-[40px]">🔍</p>
                <p className="text-[16px] font-bold text-foreground">Ничего не найдено</p>
                <p className="text-[14px] text-muted-foreground text-center">Попробуйте изменить фильтры</p>
              </motion.div>
            ) : (
              filteredProducts.map((product) => (
                <motion.button
                  key={product.id}
                  variants={cardVariants}
                  onClick={() => onProductClick(product)}
                  className="bg-muted rounded-[26px] p-3 flex flex-col gap-3 text-left w-full"
                  whileTap={{ scale: 0.97 }}
                >
                  <div className="relative h-[132px] rounded-[20px] overflow-hidden bg-card p-2 w-full">
                    <img
                      src={product.imageSrc}
                      alt={product.title}
                      className="w-full h-full object-cover rounded-[16px]"
                      style={{ opacity: product.inStock === false ? 0.45 : 1 }}
                    />
                    {product.inStock === false && (
                      <div className="absolute inset-0 flex items-end p-2">
                        <span className="text-[11px] font-bold px-2 py-1 rounded-full" style={{ background: 'rgba(9,9,11,0.7)', color: '#ffffff' }}>
                          Нет в наличии
                        </span>
                      </div>
                    )}
                    {product.discount && product.inStock !== false && (
                      <div
                        className="absolute top-2 left-2 px-2 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: 'rgba(46,139,87,0.12)', color: '#2e8b57' }}
                      >
                        {product.discount}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-[16px] font-bold text-foreground truncate tracking-tight">{product.title}</p>
                    <p className="text-[13px] font-medium text-muted-foreground truncate">{product.weight}</p>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <p className="text-[17px] font-bold text-foreground leading-tight">{product.price} ₽</p>
                      {product.oldPrice && (
                        <p className="text-[12px] font-medium text-muted-foreground line-through">{product.oldPrice} ₽</p>
                      )}
                    </div>
                    <motion.div
                      onClick={(e) => handleAdd(e, product.id, product.inStock)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden${(cartQty[product.id] ?? 0) > 0 ? ' pointer-events-none' : ''}`}
                      animate={{
                        backgroundColor: product.inStock === false
                          ? '#e4e4e7'
                          : (cartQty[product.id] ?? 0) > 0 ? '#2e8b57' : '#09090b'
                      }}
                      transition={{ duration: 0.25 }}
                      whileTap={{ scale: 0.85 }}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {(cartQty[product.id] ?? 0) > 0 ? (
                          <motion.span
                            key="check"
                            initial={{ scale: 0, rotate: -45, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: 45, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                            style={{ color: '#ffffff', fontSize: 17, fontWeight: 800, lineHeight: 1 }}
                          >
                            ✓
                          </motion.span>
                        ) : (
                          <motion.div
                            key="plus"
                            initial={{ scale: 0, rotate: 45, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0, rotate: -45, opacity: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          >
                            <HugeiconsIcon icon={PlusSignIcon} size={18} color={product.inStock === false ? '#a1a1aa' : '#ffffff'} strokeWidth={2.5} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </motion.button>
              ))
            )}
          </motion.div>
        </AnimatePresence>

      </div>

      {/* ── Filter bottom sheet ──────────────────────────────────────────────── */}
      {createPortal(
        <AnimatePresence>
          {isFilterOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                onClick={() => setIsFilterOpen(false)}
                className="fixed inset-0"
                style={{ background: 'rgba(9,9,11,0.28)', zIndex: 90 }}
              />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 38 }}
              className="fixed bottom-0 left-0 right-0 bg-background rounded-t-[32px] flex flex-col"
              style={{ maxHeight: '85vh', boxShadow: '0 -4px 40px rgba(9,9,11,0.12)', zIndex: 100 }}
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-muted-foreground opacity-30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 shrink-0">
                <h2 className="text-[20px] font-bold text-foreground tracking-tighter">Фильтры</h2>
                <motion.button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-9 h-9 rounded-full bg-muted flex items-center justify-center"
                  whileTap={{ scale: 0.88 }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} color="#09090b" />
                </motion.button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto px-5 pb-2" style={{ scrollbarWidth: 'none' }}>

                {/* Sort */}
                <div className="mb-6">
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Сортировка по цене</p>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={() => setPendingSort(pendingSort === 'asc' ? null : 'asc')}
                      className="flex-1 h-12 rounded-[18px] flex items-center justify-center gap-2 text-[14px] font-bold"
                      style={
                        pendingSort === 'asc'
                          ? { background: '#2e8b57', color: '#ffffff' }
                          : { background: 'var(--muted)', color: 'var(--foreground)' }
                      }
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="text-base">↑</span>
                      Дешевле
                    </motion.button>
                    <motion.button
                      onClick={() => setPendingSort(pendingSort === 'desc' ? null : 'desc')}
                      className="flex-1 h-12 rounded-[18px] flex items-center justify-center gap-2 text-[14px] font-bold"
                      style={
                        pendingSort === 'desc'
                          ? { background: '#2e8b57', color: '#ffffff' }
                          : { background: 'var(--muted)', color: 'var(--foreground)' }
                      }
                      whileTap={{ scale: 0.96 }}
                    >
                      <span className="text-base">↓</span>
                      Дороже
                    </motion.button>
                  </div>
                </div>

                {/* Category checkboxes */}
                <div className="mb-6">
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Категория</p>
                  <div className="flex flex-col gap-1">
                    {FILTER_CATS.map((cat) => {
                      const checked = pendingCats.includes(cat)
                      return (
                        <motion.button
                          key={cat}
                          onClick={() => togglePendingCat(cat)}
                          className="flex items-center gap-3 h-12 px-4 rounded-[16px] text-left w-full"
                          style={{ background: checked ? 'rgba(46,139,87,0.08)' : 'var(--muted)' }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                            style={{ background: checked ? '#2e8b57' : 'transparent', border: checked ? 'none' : '2px solid #d4d4d8' }}
                          >
                            {checked && '✓'}
                          </div>
                          <span className="text-[15px] font-semibold" style={{ color: checked ? '#2e8b57' : 'var(--foreground)' }}>
                            {cat}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* In stock */}
                <div className="mb-6">
                  <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Наличие</p>
                  <motion.button
                    onClick={() => setPendingInStock(!pendingInStock)}
                    className="flex items-center gap-3 h-12 px-4 rounded-[16px] text-left w-full"
                    style={{ background: pendingInStock ? 'rgba(46,139,87,0.08)' : 'var(--muted)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white text-[13px] font-bold"
                      style={{ background: pendingInStock ? '#2e8b57' : 'transparent', border: pendingInStock ? 'none' : '2px solid #d4d4d8' }}
                    >
                      {pendingInStock && '✓'}
                    </div>
                    <span className="text-[15px] font-semibold" style={{ color: pendingInStock ? '#2e8b57' : 'var(--foreground)' }}>
                      Только в наличии
                    </span>
                  </motion.button>
                </div>

              </div>

              {/* Footer */}
              <div className="px-5 pt-3 flex gap-3 shrink-0 border-t border-muted" style={{ paddingBottom: 32 }}>
                <motion.button
                  onClick={resetFilter}
                  className="flex-1 h-14 rounded-[20px] bg-muted text-[15px] font-bold text-foreground"
                  whileTap={{ scale: 0.96 }}
                >
                  Сбросить
                </motion.button>
                <motion.button
                  onClick={applyFilter}
                  className="flex-[2] h-14 rounded-[20px] text-[15px] font-bold text-white"
                  style={{ background: '#09090b' }}
                  whileTap={{ scale: 0.96 }}
                >
                  Применить
                </motion.button>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
