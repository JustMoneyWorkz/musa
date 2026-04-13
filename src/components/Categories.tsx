import { motion } from 'framer-motion'

interface Category {
  id: string
  emoji: string
  label: string
}

const CATEGORIES: Category[] = [
  { id: 'veggies', emoji: '🥑', label: 'Овощи' },
  { id: 'fruits',  emoji: '🍎', label: 'Фрукты' },
  { id: 'nuts',    emoji: '🌰', label: 'Орехи' },
  { id: 'berries', emoji: '🍓', label: 'Ягоды' },
  { id: 'greens',  emoji: '🌿', label: 'Зелень' },
]

interface CategoriesProps {
  activeId?: string
  onSelect?: (id: string) => void
}

export default function Categories({ activeId, onSelect }: CategoriesProps) {
  return (
    <section className="pb-5">
      <motion.div
        className="flex gap-2 px-4 overflow-x-auto scrollbar-none"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.06 } },
        }}
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeId === cat.id
          return (
            <motion.button
              key={cat.id}
              variants={{
                hidden:  { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
              }}
              onClick={() => onSelect?.(cat.id)}
              whileTap={{ scale: 0.92 }}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap shrink-0 transition-all duration-200"
              style={isActive ? {
                background: 'rgba(74,222,128,0.15)',
                border: '1px solid rgba(74,222,128,0.4)',
                boxShadow: '0 0 12px rgba(74,222,128,0.15), inset 0 1px 0 rgba(74,222,128,0.2)',
              } : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span className="text-base" role="img" aria-hidden="true">{cat.emoji}</span>
              <span
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: isActive ? '#4ADE80' : 'rgba(255,255,255,0.7)' }}
              >
                {cat.label}
              </span>
            </motion.button>
          )
        })}
      </motion.div>
    </section>
  )
}
