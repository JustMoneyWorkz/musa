import { useState } from 'react'
import { Heart, X, Plus } from 'lucide-react'
import { Product } from '../components/ProductCard'

interface CrossSellItem {
  id: string
  title: string
  price: number
  oldPrice?: number
  discount?: string
  imageSrc: string
}

const CROSS_SELL: CrossSellItem[] = [
  {
    id: 'cs1',
    title: 'Голубика свежая, 125 г',
    price: 450,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/c33c2bb3-3ba3-4e0c-bd42-69e8058a9c05.jpg',
  },
  {
    id: 'cs2',
    title: 'Малина отборная, 125 г',
    price: 510,
    oldPrice: 600,
    discount: '-15%',
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/43b69940-d927-4898-aa67-00f3cf8c3f1e.jpg',
  },
  {
    id: 'cs3',
    title: 'Кешью жареный, 100 г',
    price: 320,
    imageSrc: 'https://storage.googleapis.com/banani-generated-images/generated-images/90c8b519-8cf6-4f9e-ab9f-3a171609e0bf.jpg',
  },
]

const NUTRITION = [
  { value: '41', label: 'ккал' },
  { value: '0.8', label: 'белки' },
  { value: '0.4', label: 'жиры' },
  { value: '7.5', label: 'углеводы' },
]

interface ProductPageProps {
  product: Product
  onClose: () => void
  onAddToCart: (id: string) => void
}

export default function ProductPage({ product, onClose, onAddToCart }: ProductPageProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [nutritionPer, setNutritionPer] = useState<'100g' | 'serving'>('100g')
  const [activeVariant, setActiveVariant] = useState(0)

  const variants = [product.weight, product.weight === '250 г' ? '500 г' : '1 кг']
  const description =
    'Сладкая и ароматная клубника, бережно собранная на фермерских хозяйствах. Идеально подходит для десертов, смузи или просто в качестве лёгкого и полезного перекуса. Выращена без применения химических удобрений.'
  const shortDesc = description.slice(0, 90) + '...'

  return (
    <div className="flex flex-col min-h-screen pb-[120px] bg-background">

      {/* 1. Gallery */}
      <section className="relative bg-muted rounded-b-[24px] pb-5 mb-6">
        {/* Action buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={() => setIsFavorite((v) => !v)}
            className="w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center"
            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-destructive-foreground text-destructive-foreground' : 'text-foreground'}
            />
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center"
            aria-label="Закрыть"
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Main image */}
        <div className="w-full aspect-square flex items-center justify-center p-6">
          <img
            src={product.imageSrc}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply"
          />
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-foreground' : 'bg-[#d1d1d6]'}`}
            />
          ))}
        </div>
      </section>

      {/* 2. Title + description */}
      <section className="px-4 pb-6">
        <div className="mb-3">
          <h1 className="text-2xl font-bold text-foreground inline leading-tight">{product.title}</h1>
          <span className="text-xl font-medium text-muted-foreground ml-1.5 inline">{product.weight}</span>
        </div>
        <p className="text-[15px] leading-snug text-muted-foreground">
          {expanded ? description : shortDesc}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-foreground font-medium ml-1"
            >
              Развернуть
            </button>
          )}
        </p>
      </section>

      {/* 3. Variants */}
      <section className="pb-6">
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none">
          {variants.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveVariant(i)}
              className="flex flex-col items-center gap-2 w-[72px] shrink-0"
            >
              <div
                className={`w-[72px] h-[72px] rounded-lg bg-muted p-2 flex items-center justify-center border-2 transition-colors ${
                  activeVariant === i ? 'border-foreground' : 'border-transparent'
                }`}
              >
                <img
                  src={product.imageSrc}
                  alt={label}
                  className="w-full h-full object-contain mix-blend-multiply"
                />
              </div>
              <span
                className={`text-xs text-center w-full truncate ${
                  activeVariant === i ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Nutrition */}
      <section className="px-4 pb-8">
        <div className="bg-muted rounded-[24px] px-5 py-4">
          <div className="flex items-center gap-1.5 text-sm mb-4">
            <button
              onClick={() => setNutritionPer('100g')}
              className={nutritionPer === '100g' ? 'text-foreground font-semibold' : 'text-muted-foreground'}
            >
              На 100 г
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              onClick={() => setNutritionPer('serving')}
              className={nutritionPer === 'serving' ? 'text-foreground font-semibold' : 'text-muted-foreground'}
            >
              На порцию
            </button>
          </div>
          <div className="flex justify-between">
            {NUTRITION.map((n) => (
              <div key={n.label} className="flex flex-col">
                <span className="text-xl font-semibold text-foreground">{n.value}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Cross-sell */}
      <section className="pb-8">
        <h2 className="text-xl font-bold text-foreground mb-4 px-4">Может, ещё кое-что?</h2>
        <div className="flex gap-3 px-4 overflow-x-auto scrollbar-none">
          {CROSS_SELL.map((item) => (
            <div key={item.id} className="w-[130px] shrink-0 flex flex-col">
              <div className="w-[130px] h-[130px] bg-muted rounded-lg mb-2.5 relative p-4 flex items-center justify-center">
                {item.discount && (
                  <span className="absolute top-2 left-2 bg-destructive-foreground text-white text-[11px] font-bold px-1.5 py-0.5 rounded-md">
                    {item.discount}
                  </span>
                )}
                <img
                  src={item.imageSrc}
                  alt={item.title}
                  className="w-full h-full object-contain mix-blend-multiply"
                  loading="lazy"
                />
                <button
                  onClick={() => onAddToCart(item.id)}
                  aria-label={`Добавить ${item.title} в корзину`}
                  className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.08)] flex items-center justify-center"
                >
                  <Plus size={18} className="text-foreground" />
                </button>
              </div>
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-base font-bold text-destructive-foreground">{item.price} ₽</span>
                {item.oldPrice && (
                  <span className="text-xs text-muted-foreground line-through">{item.oldPrice} ₽</span>
                )}
              </div>
              <span className="text-[13px] leading-snug text-foreground line-clamp-2">{item.title}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Fixed bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-4 pt-4 pb-8 flex items-center justify-between z-50">
        <div className="flex flex-col">
          <span className="text-2xl font-bold text-destructive-foreground leading-none">
            {product.oldPrice ? product.price : product.price} ₽
          </span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through mt-0.5">{product.oldPrice} ₽</span>
          )}
        </div>
        <button
          onClick={() => onAddToCart(product.id)}
          className="flex-1 ml-6 h-[52px] rounded-full bg-primary text-primary-foreground text-base font-semibold flex items-center justify-center"
        >
          В корзину
        </button>
      </div>
    </div>
  )
}
