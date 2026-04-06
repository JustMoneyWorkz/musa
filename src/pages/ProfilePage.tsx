import { History, Heart, SlidersHorizontal, Headphones, ChevronRight, LucideIcon } from 'lucide-react'

interface MenuItem {
  id: string
  label: string
  Icon: LucideIcon
  onClick?: () => void
}

const MENU_ITEMS: MenuItem[] = [
  { id: 'orders', label: 'История заказов', Icon: History },
  { id: 'favorites', label: 'Избранное', Icon: Heart },
  { id: 'preferences', label: 'Мои предпочтения', Icon: SlidersHorizontal },
  { id: 'support', label: 'Поддержка', Icon: Headphones },
]

const USER = {
  name: 'Иван Иванов',
  phone: '+7 999 123-45-67',
  avatarSrc: 'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F0',
}

export default function ProfilePage() {
  return (
    <div className="flex flex-col min-h-screen pb-[90px]">
      {/* Profile header */}
      <header className="flex items-center gap-4 px-4 pt-8 pb-6">
        <img
          src={USER.avatarSrc}
          alt={USER.name}
          className="w-[72px] h-[72px] rounded-full object-cover shrink-0"
        />
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold text-foreground tracking-tight">{USER.name}</h1>
          <p className="text-[15px] text-muted-foreground">{USER.phone}</p>
        </div>
      </header>

      {/* Menu */}
      <section className="px-4">
        <div className="bg-card rounded-lg overflow-hidden">
          {MENU_ITEMS.map((item, index) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className="w-full flex items-center pl-4 text-left bg-transparent"
              aria-label={item.label}
            >
              <div className="w-6 h-6 flex items-center justify-center shrink-0 mr-4">
                <item.Icon size={24} className="text-foreground" />
              </div>
              <div
                className={`flex-1 flex items-center justify-between py-4 pr-4 ${
                  index < MENU_ITEMS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span className="text-base font-medium text-foreground">{item.label}</span>
                <ChevronRight size={20} className="text-[#c7c7cc] shrink-0" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
