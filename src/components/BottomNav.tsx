import { House, LayoutGrid, Heart, User } from 'lucide-react'

type NavTab = 'home' | 'catalog' | 'favorites' | 'profile'

const NAV_ITEMS: { id: NavTab; label: string; Icon: React.ElementType }[] = [
  { id: 'home', label: 'Главная', Icon: House },
  { id: 'catalog', label: 'Категории', Icon: LayoutGrid },
  { id: 'favorites', label: 'Избранное', Icon: Heart },
  { id: 'profile', label: 'Профиль', Icon: User },
]

interface BottomNavProps {
  active?: NavTab
  onNavigate?: (tab: NavTab) => void
}

export default function BottomNav({ active = 'home', onNavigate }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-around px-4 pt-3 pb-7 bg-white/95 backdrop-blur-md border-t border-border"
      aria-label="Навигация"
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = active === id
        return (
          <button
            key={id}
            onClick={() => onNavigate?.(id)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`flex flex-col items-center gap-1 transition-colors ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
