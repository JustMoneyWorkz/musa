import { useState } from 'react'
import Header from './components/Header'
import Categories from './components/Categories'
import PromoBanner from './components/PromoBanner'
import ProductCard, { Product } from './components/ProductCard'
import BottomNav from './components/BottomNav'
import CatalogPage from './pages/CatalogPage'
import ProfilePage from './pages/ProfilePage'
import ProductPage from './pages/ProductPage'

type Tab = 'home' | 'catalog' | 'favorites' | 'profile'

const PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'Бананы Эквадор отборные',
    weight: '1 кг',
    price: 120,
    oldPrice: 150,
    discount: '-20%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/5938d34f-6496-4014-9a92-02237ab45ca6.jpg',
  },
  {
    id: '2',
    title: 'Авокадо Хасс спелое',
    weight: '2 шт',
    price: 350,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/2145bd06-0a3b-45a0-a013-d0d90f984453.jpg',
  },
  {
    id: '3',
    title: 'Грецкий орех очищенный',
    weight: '200 г',
    price: 450,
    oldPrice: 530,
    discount: '-15%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/131fab7b-70d3-4c63-9b92-d252f2fe5e56.jpg',
  },
  {
    id: '4',
    title: 'Помидоры Черри сладкие',
    weight: '250 г',
    price: 220,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/7e86f886-51b0-44b9-b6d6-e57cfb48ef30.jpg',
  },
]

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string | undefined>(undefined)
  const [cartItems, setCartItems] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const handleAddToCart = (id: string) => {
    setCartItems((prev) => [...prev, id])
  }

  // Product detail page overrides everything
  if (selectedProduct) {
    return (
      <ProductPage
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(id) => { handleAddToCart(id); setSelectedProduct(null) }}
      />
    )
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'catalog':
        return <CatalogPage onBack={() => setActiveTab('home')} />
      case 'profile':
        return <ProfilePage />
      default:
        return (
          <div className="flex flex-col min-h-screen pb-[90px]">
            <Header
              cartCount={cartItems.length}
              onCartClick={() => setActiveTab('home')}
            />

            <Categories
              activeId={activeCategory}
              onSelect={(id) => setActiveCategory((prev) => (prev === id ? undefined : id))}
            />

            <PromoBanner
              title={'Свежий\nурожай'}
              subtitle="Скидки до 20%"
              imageSrc="https://storage.googleapis.com/banani-generated-images/generated-images/5d68abf5-fa12-46e3-b51e-69bc998ac21f.jpg"
              imageAlt="Свежие овощи и фрукты"
            />

            <section className="px-4 pb-6">
              <h3 className="text-xl font-bold text-foreground mb-4">Популярное</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-7">
                {PRODUCTS.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onClick={(id) => {
                      const p = PRODUCTS.find((p) => p.id === id)
                      if (p) setSelectedProduct(p)
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <>
      {renderPage()}
      <BottomNav active={activeTab} onNavigate={setActiveTab} />
    </>
  )
}
