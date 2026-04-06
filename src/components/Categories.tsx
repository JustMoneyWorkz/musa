interface Category {
  id: string
  emoji: string
  label: string
}

const CATEGORIES: Category[] = [
  { id: 'veggies', emoji: '🥑', label: 'Овощи' },
  { id: 'fruits', emoji: '🍎', label: 'Фрукты' },
  { id: 'nuts', emoji: '🌰', label: 'Орехи' },
  { id: 'berries', emoji: '🍓', label: 'Ягоды' },
  { id: 'greens', emoji: '🌿', label: 'Зелень' },
]

interface CategoriesProps {
  activeId?: string
  onSelect?: (id: string) => void
}

export default function Categories({ activeId, onSelect }: CategoriesProps) {
  return (
    <section className="pb-5">
      <div className="flex gap-2.5 px-4 overflow-x-auto scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect?.(cat.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full whitespace-nowrap transition-colors ${
              activeId === cat.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-foreground'
            }`}
          >
            <span className="text-base" role="img" aria-hidden="true">{cat.emoji}</span>
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
