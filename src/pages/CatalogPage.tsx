import { ArrowLeft } from 'lucide-react'
import CategoryCard from '../components/CategoryCard'

const CATEGORIES = [
  {
    id: 'fruits',
    title: 'Фрукты',
    imageSrc: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800&q=80',
  },
  {
    id: 'veggies',
    title: 'Овощи',
    imageSrc: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  },
  {
    id: 'nuts',
    title: 'Орехи',
    gradient: 'linear-gradient(135deg, #c8a96e 0%, #8b6340 100%)',
  },
  {
    id: 'berries',
    title: 'Ягоды',
    gradient: 'linear-gradient(135deg, #e8667a 0%, #9b2335 100%)',
  },
  {
    id: 'greens',
    title: 'Зелень',
    gradient: 'linear-gradient(135deg, #6dbf7e 0%, #2d7a3a 100%)',
  },
]

interface CatalogPageProps {
  onBack?: () => void
}

export default function CatalogPage({ onBack }: CatalogPageProps) {
  return (
    <div className="flex flex-col min-h-screen pb-[90px]">
      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center px-4 py-4 bg-background">
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0"
          aria-label="Назад"
        >
          <ArrowLeft size={24} className="text-foreground" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-foreground -translate-x-[22px]">
          Каталог
        </h1>
      </header>

      {/* Category list */}
      <section className="px-4 pt-2 pb-6 flex flex-col gap-4">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.id}
            title={cat.title}
            imageSrc={cat.imageSrc}
            gradient={cat.gradient}
          />
        ))}
      </section>
    </div>
  )
}
