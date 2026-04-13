import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { PlusSignIcon } from '@hugeicons/core-free-icons'

export interface Product {
  id: string
  title: string
  weight: string
  price: number
  oldPrice?: number
  discount?: string
  imageSrc: string
  category?: string
  inStock?: boolean
}

interface ProductCardProps {
  product: Product
  onAddToCart?: (id: string) => void
  onClick?: (id: string) => void
  index?: number
}

export default function ProductCard({ product, onAddToCart, onClick, index = 0 }: ProductCardProps) {
  const { id, title, weight, price, oldPrice, discount, imageSrc } = product

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      onClick={() => onClick?.(id)}
      className="flex items-center gap-4 py-4 cursor-pointer"
    >
      {/* Image */}
      <div className="relative shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-muted">
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount && (
          <span className="absolute top-1 left-1 text-[9px] font-bold bg-red-500 text-white rounded px-1 leading-4">
            {discount}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-base font-semibold text-foreground tracking-tight truncate">{title}</h4>
        <p className="text-[13px] text-muted-foreground font-medium mt-0.5">{weight}</p>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end shrink-0 mr-2">
        <span className="text-base font-bold text-foreground tracking-tight">{price} ₽</span>
        {oldPrice && (
          <span className="text-[12px] text-muted-foreground line-through">{oldPrice} ₽</span>
        )}
      </div>

      {/* Add button */}
      <motion.button
        onClick={(e) => { e.stopPropagation(); onAddToCart?.(id) }}
        aria-label={`Добавить ${title} в корзину`}
        className="shrink-0 w-9 h-9 rounded-full bg-foreground flex items-center justify-center"
        whileTap={{ scale: 0.82 }}
        whileHover={{ scale: 1.08 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <HugeiconsIcon icon={PlusSignIcon} size={18} color="#ffffff" strokeWidth={2.5} />
      </motion.button>
    </motion.div>
  )
}
