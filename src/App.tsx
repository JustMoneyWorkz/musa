import { useState, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Leaf01Icon, ShoppingBasket03Icon, StarIcon, CustomerService01Icon } from '@hugeicons/core-free-icons'
import ProductCard, { Product } from './components/ProductCard'
import BottomNav from './components/BottomNav'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import BrowsePage from './pages/BrowsePage'
import FavoritesPage from './pages/FavoritesPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import CheckoutPage from './pages/CheckoutPage'
import AddressesPage from './pages/AddressesPage'
import PaymentPage from './pages/PaymentPage'
import SupportPage from './pages/SupportPage'
import { useCart } from './hooks/useCart'
import { useFavorites } from './hooks/useFavorites'
import { useAddresses } from './hooks/useAddresses'
import { useOrders } from './hooks/useOrders'
import { useAdmin } from './hooks/useAdmin'
import AdminPage from './pages/AdminPage'
import { Order } from './lib/api'

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
  const { cartQty, cartCount, addToCart, decrement, clearCart } = useCart()
  const { favoriteIds, favoritesCount, toggleFavorite, refreshFavorites } = useFavorites()
  const addresses = useAddresses()
  const { orders, loading: ordersLoading, activeOrder, ordersCount, refreshOrders } = useOrders()
  const { isAdmin } = useAdmin()

  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [adminOpen, setAdminOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [browseCategory, setBrowseCategory] = useState<string | undefined>(undefined)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [profileSection, setProfileSection] = useState<ProfileSection | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [globalToast, setGlobalToast] = useState<string | null>(null)
  const prevTabRef = useRef<Tab>('home')

  const showGlobalToast = (msg: string) => {
    setGlobalToast(msg)
    setTimeout(() => setGlobalToast(null), 2500)
  }

  const handleNavigate = (tab: Tab) => {
    if (tab === activeTab) return
    prevTabRef.current = activeTab
    if (tab !== 'catalog') setBrowseCategory(undefined)
    setActiveTab(tab)
    setSelectedProduct(null)
    setFavoritesOpen(false)
    setProfileSection(null)
    setCheckoutOpen(false)
    window.scrollTo(0, 0)
  }

  const handleCategoryClick = (categoryTitle: string) => {
    prevTabRef.current = activeTab
    setBrowseCategory(categoryTitle)
    setActiveTab('catalog')
    window.scrollTo(0, 0)
  }

  const direction = TAB_ORDER.indexOf(activeTab) - TAB_ORDER.indexOf(prevTabRef.current)

  const handleProfileMenuClick = (id: string) => {
    if (id === 'favorites') {
      refreshFavorites()
      setFavoritesOpen(true)
    } else if (id === 'orders' || id === 'addresses' || id === 'payment' || id === 'support') {
      setProfileSection(id)
    }
  }

  const cartItems = PRODUCTS
    .filter((p) => cartQty[p.id])
    .map((p) => ({ product: p, qty: cartQty[p.id] }))

  // ─── Home page ─────────────────────────────────────────────────────────────
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user
  const homeAvatarSrc: string = tgUser?.photo_url ?? ''

  const homePage = (
    <div className="flex flex-col min-h-screen pb-[110px]">
      {/* Home header — no search */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex items-center justify-between px-5 pt-6 pb-2"
      >
        <div className="flex items-center gap-2.5">
          {/* Logo — BlurFade: blur+scale, delay after page loads */}
          <motion.img
            src="/logo.svg"
            alt="СВОЙнабор"
            className="w-10 h-10 object-contain shrink-0"
            initial={{ opacity: 0, filter: 'blur(10px)', scale: 0.78 }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          />
          <div>
            <motion.p
              className="text-[12px] font-medium text-muted-foreground leading-none mb-0.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.62 }}
            >
              Добро пожаловать
            </motion.p>
            {/* TextRoll — каждая буква вращается по оси X (barrel-roll) */}
            <h1 className="text-[19px] font-bold text-foreground tracking-tighter leading-none flex" style={{ perspective: 500 }}>
              {'СВОЙнабор'.split('').map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: 0.55 + i * 0.045 }}
                  style={{ display: 'inline-block', transformOrigin: '50% 100%' }}
                >
                  {char}
                </motion.span>
              ))}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => (window as unknown as { Telegram?: { WebApp?: { openTelegramLink?: (u: string) => void } } })
              .Telegram?.WebApp?.openTelegramLink?.('https://t.me/musa_support')}
            className="w-11 h-11 rounded-full bg-muted flex items-center justify-center"
            aria-label="Поддержка"
          >
            <HugeiconsIcon icon={CustomerService01Icon} size={20} color="#09090b" />
          </button>
          {homeAvatarSrc ? (
            <motion.img
              src={homeAvatarSrc}
              alt="Профиль"
              className="w-11 h-11 rounded-full object-cover"
              whileTap={{ scale: 0.92 }}
            />
          ) : (
            <motion.div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
              whileTap={{ scale: 0.92 }}
            >
              <span className="text-white text-base font-bold">М</span>
            </motion.div>
          )}
        </div>
      </motion.div>

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
            onClick={() => handleNavigate('catalog')}
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

        {/* Reviews block */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.38, delay: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex items-center gap-4 rounded-[20px] px-5 py-4 bg-muted"
        >
          <div
            className="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0 text-[18px]"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
          >
            <HugeiconsIcon icon={StarIcon} size={20} color="#ffffff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold text-foreground tracking-tighter">5.0</span>
              <div className="flex items-center gap-[2px]">
                {[...Array(5)].map((_, i) => (
                  <HugeiconsIcon key={i} icon={StarIcon} size={12} color="#f59e0b" />
                ))}
              </div>
            </div>
            <p className="text-[13px] font-medium text-muted-foreground mt-0.5">25+ довольных клиентов</p>
          </div>
          <span className="text-[12px] font-bold px-3 py-1.5 rounded-full shrink-0"
                style={{ background: 'rgba(46,139,87,0.10)', color: '#2e8b57' }}>
            Отзывы
          </span>
        </motion.div>

      </div>
    </div>
  )

  const renderPage = () => {
    switch (activeTab) {
      case 'catalog':   return <BrowsePage key={browseCategory ?? 'all'} products={PRODUCTS} initialCategory={browseCategory} onAddToCart={addToCart} onProductClick={(p) => setSelectedProduct(p)} cartQty={cartQty} />
      case 'favorites': return <CartPage items={cartItems} onIncrement={addToCart} onDecrement={decrement} onCheckout={() => setCheckoutOpen(true)} />
      case 'profile':   return <ProfilePage onMenuClick={handleProfileMenuClick} favoritesCount={favoritesCount} ordersCount={ordersCount} addressesCount={addresses.addresses.length} activeOrder={activeOrder} onOrderClick={() => setProfileSection('orders')} isAdmin={isAdmin} onAdminClick={() => setAdminOpen(true)} />
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
            className="fixed inset-0 overflow-y-auto bg-background"
            style={{ willChange: 'transform, opacity', zIndex: 90 }}
          >
            <FavoritesPage
              products={PRODUCTS}
              favoriteIds={favoriteIds}
              onProductClick={(p) => { setFavoritesOpen(false); setSelectedProduct(p) }}
              onAddToCart={addToCart}
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
            className="fixed inset-0 overflow-y-auto bg-background"
            style={{ willChange: 'transform, opacity', zIndex: 90 }}
          >
            <ProductPage
              product={selectedProduct}
              onClose={() => { setSelectedProduct(null); refreshFavorites() }}
              onAddToCart={(id) => { addToCart(id); setSelectedProduct(null); handleNavigate('favorites') }}
              onToggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile section overlays */}
      <AnimatePresence>
        {profileSection === 'orders' && (
          <motion.div key="orders-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 90 }}>
            <OrdersPage onClose={() => setProfileSection(null)} orders={orders} loading={ordersLoading} onRefresh={refreshOrders} onOrderClick={(o) => setSelectedOrder(o)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Order detail overlay */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div key="order-detail-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 95 }}>
            <OrderDetailPage
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onOrderUpdated={(updated) => {
                setSelectedOrder(updated)
                refreshOrders()
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'addresses' && (
          <motion.div key="addresses-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 90 }}>
            <AddressesPage onClose={() => setProfileSection(null)} onShowToast={showGlobalToast} addressesHook={addresses} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'payment' && (
          <motion.div key="payment-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 90 }}>
            <PaymentPage onClose={() => setProfileSection(null)} onShowToast={showGlobalToast} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {profileSection === 'support' && (
          <motion.div key="support-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 90 }}>
            <SupportPage onClose={() => setProfileSection(null)} onShowToast={showGlobalToast} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {checkoutOpen && (
          <motion.div key="checkout-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 90 }}>
            <CheckoutPage
              items={cartItems}
              onClose={() => setCheckoutOpen(false)}
              onConfirm={(_orderId) => { setCheckoutOpen(false); clearCart(); refreshOrders() }}
              savedAddresses={addresses.addresses}
              onSaveAddress={addresses.addAddress}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Admin panel overlay */}
      <AnimatePresence>
        {adminOpen && (
          <motion.div key="admin-overlay" variants={overlayVariants} initial="hidden" animate="visible" exit="exit"
            transition={{ y: { type: 'spring', stiffness: 300, damping: 35 }, opacity: { duration: 0.2 } }}
            className="fixed inset-0 overflow-y-auto bg-background" style={{ willChange: 'transform, opacity', zIndex: 100 }}>
            <AdminPage isAdmin={isAdmin} onClose={() => setAdminOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global toast */}
      <AnimatePresence>
        {globalToast && (
          <motion.div
            key="global-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 left-5 right-5 bg-foreground text-white text-center py-3.5 rounded-[16px] text-[14px] font-bold"
            style={{ zIndex: 200 }}
          >
            {globalToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
