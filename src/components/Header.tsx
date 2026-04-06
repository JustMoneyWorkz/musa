import { Search, ShoppingBag } from 'lucide-react'

interface HeaderProps {
  cartCount?: number
  onSearchClick?: () => void
  onCartClick?: () => void
}

export default function Header({ cartCount = 0, onSearchClick, onCartClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex items-center gap-3 px-4 py-4 bg-background">
      <button
        className="flex-1 flex items-center gap-2 bg-muted px-4 h-11 rounded-full text-left"
        onClick={onSearchClick}
        aria-label="Поиск"
      >
        <Search size={20} className="text-muted-foreground shrink-0" />
        <span className="text-[15px] text-muted-foreground">Найти в магазине</span>
      </button>

      <button
        className="relative w-11 h-11 rounded-full bg-muted flex items-center justify-center shrink-0"
        onClick={onCartClick}
        aria-label={`Корзина${cartCount > 0 ? `, ${cartCount} товаров` : ''}`}
      >
        <ShoppingBag size={24} className="text-foreground" />
        {cartCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-destructive-foreground rounded-full border-2 border-muted" />
        )}
      </button>
    </header>
  )
}
