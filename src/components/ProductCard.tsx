import { Plus } from 'lucide-react'

export interface Product {
  id: string
  title: string
  weight: string
  price: number
  oldPrice?: number
  discount?: string
  imageSrc: string
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (id: string) => void
  onClick?: (id: string) => void
}

export default function ProductCard({ product, onAddToCart, onClick }: ProductCardProps) {
  const { id, title, weight, price, oldPrice, discount, imageSrc } = product

  return (
    <article className="flex flex-col" onClick={() => onClick?.(id)}>
      {/* Image wrapper */}
      <div className="relative bg-card rounded-lg aspect-square flex items-center justify-center p-4">
        {discount && (
          <span className="absolute top-2.5 left-2.5 bg-destructive text-destructive-foreground text-[11px] font-semibold px-2 py-1 rounded-md z-10">
            {discount}
          </span>
        )}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(id) }}
          aria-label={`Добавить ${title} в корзину`}
          className="absolute bottom-[-14px] right-3 w-8 h-8 rounded-full bg-background shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex items-center justify-center z-20"
        >
          <Plus size={20} className="text-foreground" />
        </button>
      </div>

      {/* Info */}
      <div className="pt-5 flex flex-col">
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className={`text-base font-bold ${oldPrice ? 'text-destructive-foreground' : 'text-foreground'}`}>
            {price} ₽
          </span>
          {oldPrice && (
            <span className="text-[13px] font-medium text-muted-foreground line-through">
              {oldPrice} ₽
            </span>
          )}
        </div>
        <h4 className="text-sm font-medium leading-snug text-foreground mb-1 line-clamp-2">
          {title}
        </h4>
        <span className="text-[13px] text-muted-foreground">{weight}</span>
      </div>
    </article>
  )
}
