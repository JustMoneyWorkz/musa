import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Leaf01Icon, ShoppingBasket03Icon } from '@hugeicons/core-free-icons'
import Header from './components/Header'
import ProductCard, { Product } from './components/ProductCard'
import BottomNav from './components/BottomNav'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import BrowsePage from './pages/BrowsePage'
import FavoritesPage from './pages/FavoritesPage'
import OrdersPage from './pages/OrdersPage'
import AddressesPage from './pages/AddressesPage'
import PaymentPage from './pages/PaymentPage'
import SupportPage from './pages/SupportPage'

type ProfileSection = 'orders' | 'addresses' | 'payment' | 'support'

type Tab = 'home' | 'catalog' | 'favorites' | 'profile'
const TAB_ORDER: Tab[] = ['home', 'catalog', 'favorites', 'profile']

// ─── Home page category grid ───────────────────────────────────────────────
const HOME_CATEGORIES = [
  {
    title: 'Овощи',
    subtitle: '120+ товаров',
    icon: Leaf01Icon,
    iconColor: '#dcfce7',
    bg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
  {
    title: 'Наборы',
    subtitle: 'Готовые наборы',
    icon: ShoppingBasket03Icon,
    iconColor: '#fef3c7',
    bg: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
    iconBg: 'rgba(255,255,255,0.18)',
  },
]

// ─── Products ───────────────────────────────────────────────────────────────
const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Органические помидоры',
    weight: '1 кг · свежая ферма',
    price: 350,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg',
    ],
    category: 'Овощи',
  },
  {
    id: '2',
    title: 'Авокадо Хасс спелое',
    weight: '2 шт',
    price: 350,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
    ],
    category: 'Наборы',
  },
  {
    id: '3',
    title: 'Бананы сладкие',
    weight: '1 кг',
    price: 120,
    oldPrice: 150,
    discount: '-20%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg',
    ],
    category: 'Наборы',
  },
  {
    id: '4',
    title: 'Грецкий орех очищенный',
    weight: '200 г',
    price: 450,
    oldPrice: 530,
    discount: '-15%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg',
    ],
    category: 'Наборы',
  },
  {
    id: '5',
    title: 'Брокколи свежая',
    weight: '1 шт · фермерская',
    price: 180,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg',
    ],
    category: 'Овощи',
  },
  {
    id: '6',
    title: 'Груши зелёные',
    weight: '1 кг · сладкие',
    price: 320,
    oldPrice: 390,
    discount: '-18%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
    ],
    category: 'Наборы',
  },
  {
    id: '7',
    title: 'Клубника садовая',
    weight: '500 г · свежая',
    price: 290,
    oldPrice: 350,
    discount: '-17%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/96641d04-bc62-425b-830e-4e58414b982c.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/b8d8388a-38b0-43f9-bf50-cf6827fd3187.jpg',
    ],
    category: 'Наборы',
  },
  {
    id: '8',
    title: 'Черника отборная',
    weight: '250 г',
    price: 380,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/42268ce3-42e2-44d2-b62c-94896c6c5c3f.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
    ],
    category: 'Наборы',
    inStock: false,
  },
  {
    id: '9',
    title: 'Миндаль жареный',
    weight: '150 г',
    price: 320,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
    images: [
      'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
      'https://storage.googleapis.com/banani-generated-images/generated-images/70091f2d-3b57-4351-9a7c-349526652aa6.jpg',
    ],
    category: 'Наборы',
    inStock: false,
  },
]

// ─── Page transition variants ───────────────────────────────────────────────
const pageVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '28%' : '-28%', opacity: 0, filter: 'blur(4px)' }),
  center: { x: 0, opacity: 1, filter: 'blur(0px)' },
  exit: (dir: number) => ({ x: dir > 0 ? '-28%' : '28%', opacity: 0, filter: 'blur(4px)' }),
}
const pageTransition = {
  x: { type: 'spring' as const, stiffness: 300, damping: 32 },
  opacity: { duration: 0.2 },
  filter: { duration: 0.2 },
}
const overlayVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1 },
  exit: { y: '100%', opacity: 0 },
}

// ─── Category card stagger ───────────────────────────────────────────────────
const gridContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const gridItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [cartQty, setCartQty] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>(undefined)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem('musa_favorites') ?? '[]') } catch { return [] }
  })
  const [profileSection, setProfileSection] = useState<ProfileSection | null>(null)
  const prevTabRef = useRef<Tab>('home')

  const handleNavigate = (tab: Tab) => {
    prevTabRef.current = activeTab
    if (tab !== 'catalog') setBrowseCategory(undefined)
    setActiveTab(tab)
    setSelectedProduct(null)
    setFavoritesOpen(false)
    setProfileSection(null)
  }

  const handleCategoryClick = (categoryTitle: string) => {
    prevTabRef.current = activeTab
    setBrowseCategory(categoryTitle)
    setActiveTab('catalog')
  }

  const direction = TAB_ORDER.indexOf(activeTab) - TAB_ORDER.indexOf(prevTabRef.current)

  const handleAddToCart = (id: string) =>
    setCartQty((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))

  const handleDecrement = (id: string) =>
    setCartQty((prev) => {
      const next = { ...prev }
      if ((next[id] ?? 0) <= 1) delete next[id]
      else next[id]--
      return next
    })

  // Sync favorites from localStorage whenever product overlay closes
  const refreshFavorites = () => {
    try { setFavoriteIds(JSON.parse(localStorage.getItem('musa_favorites') ?? '[]')) } catch {}
  }

  const handleProfileMenuClick = (id: string) => {
    if (id === 'favorites') {
      refreshFavorites()
      setFavoritesOpen(true)
    } else if (id === 'orders' || id === 'addresses' || id === 'payment' || id === 'support') {
      setProfileSection(id)
    }
  }

  const cartCount = Object.values(cartQty).reduce((s, q) => s + q, 0)
  const cartItems = PRODUCTS
    .filter((p) => cartQty[p.id])
    .map((p) => ({ product: p, qty: cartQty[p.id] }))

  // ─── Home page ─────────────────────────────────────────────────────────────
  const homePage = (
    <div className="flex flex-col min-h-screen pb-[110px]">
      <Header />

      <div className="px-5 flex flex-col gap-6 pt-4">

        {/* Hero card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)' }}
        >
          {/* Decorative glow */}
          <div
            className="absolute top-[-30px] right-[-30px] w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)' }}
          />
          <h2 className="text-[28px] font-bold text-white leading-tight mb-3 tracking-tighter">
            Ваши продукты,<br />свежесобранные
          </h2>
          <p className="text-[15px] mb-6 leading-relaxed max-w-[75%]" style={{ color: '#a1a1aa' }}>
            Храните, управляйте и заказывайте свежие фермерские продукты в одном месте.
          </p>
          <motion.button
            className="bg-white text-foreground font-semibold text-[15px] px-6 py-3.5 rounded-full"
            whileTap={{ scale: 0.94 }}
          >
            Начать
          </motion.button>
        </motion.div>

        {/* Categories section */}
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tighter mb-4">Категории</h2>
          <motion.div
            variants={gridContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-4"
          >
            {HOME_CATEGORIES.map(({ title, subtitle, icon, iconColor, bg, iconBg }) => (
              <motion.button
                key={title}
                variants={gridItem}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCategoryClick(title)}
                className="rounded-xl h-[140px] flex flex-col justify-between p-5 text-left overflow-hidden"
                style={{ background: bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: iconBg }}
                >
                  <HugeiconsIcon icon={icon} size={22} color={iconColor} />
                </div>
                <div>
                  <h3 className="text-[17px] font-semibold text-white leading-tight">{title}</h3>
                  <p className="text-[13px] mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{subtitle}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  )

  const renderPage = () => {
    switch (activeTab) {
      case 'catalog':   return <BrowsePage key={browseCategory ?? 'all'} products={PRODUCTS} initialCategory={browseCategory} onAddToCart={handleAddToCart} onProductClick={(p) => setSelectedProduct(p)} cartQty={cartQty} />
      case 'favorites': return <CartPage items={cartItems} onIncrement={handleAddToCart} onDecrement={handleDecrement} />
      case 'profile':   return <ProfilePage onMenuClick={handleProfileMenuClick} />
      default: return homePage
    }
  }

  return (
    <div className="relative overflow-hidden min-h-screen">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={activeTab}
          custom={direction}
          variants={pageVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={pageTransition}
          style={{ willChange: 'transform, opacity, filter' }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      <BottomNav active={activeTab} onNavigate={handleNavigate} cartCount={cartCount} />

      {/* Favorites overlay */}
      <AnimatePresence>
        {favoritesOpen && (
          <motion.div
            key="favorites-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background"
            style={{ willChange: 'transform, opacity' }}
          >
            <FavoritesPage
              products={PRODUCTS}
              favoriteIds={favoriteIds}
              onProductClick={(p) => { setFavoritesOpen(false); setSelectedProduct(p) }}
              onAddToCart={handleAddToCart}
              onClose={() => setFavoritesOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product detail modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            key="product-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background"
            style={{ willChange: 'transform, opacity' }}
          >
            <ProductPage
              product={selectedProduct}
              onClose={() => { setSelectedProduct(null); refreshFavorites() }}
              onAddToCart={(id) => { handleAddToCart(id); setSelectedProduct(null); handleNavigate('favorites') }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile section overlays */}
      <AnimatePresence>
        {profileSection === 'orders' && (
          <motion.div key="orders-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity' }}>
            <OrdersPage onClose={() => setProfileSection(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'addresses' && (
          <motion.div key="addresses-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity' }}>
            <AddressesPage onClose={() => setProfileSection(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'payment' && (
          <motion.div key="payment-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity' }}>
            <PaymentPage onClose={() => setProfileSection(null)} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'support' && (
          <motion.div key="support-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 z-50 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity' }}>
            <SupportPage onClose={() => setProfileSection(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
