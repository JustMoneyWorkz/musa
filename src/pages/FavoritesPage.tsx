import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, PlusSignIcon, FavouriteIcon } from '@hugeicons/core-free-icons'
import { Product } from '../components/ProductCard'

interface FavoritesPageProps {
  products: Product[]
  favoriteIds: string[]
  onProductClick: (product: Product) => void
  onAddToCart: (id: string) => void
  onClose: () => void
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
}
const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function FavoritesPage({ products, favoriteIds, onProductClick, onAddToCart, onClose }: FavoritesPageProps) {
  const favProducts = products.filter(p => favoriteIds.includes(p.id))

  return (
    <div className="flex flex-col min-h-screen bg-background pb-[110px]">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 pt-6 pb-4"
      >
        <motion.button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Назад"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} color="#09090b" />
        </motion.button>
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Избранное</h1>
        <div className="w-10 h-10" />
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        >
          <h2 className="text-[28px] font-bold text-foreground tracking-tighter leading-tight">
            Сохранённые
          </h2>
          <p className="text-[14px] font-medium text-muted-foreground mt-1">
            {favProducts.length > 0
              ? `${favProducts.length} товар${favProducts.length === 1 ? '' : favProducts.length < 5 ? 'а' : 'ов'} в избранном`
              : 'Пока ничего не добавлено'}
          </p>
        </motion.div>

        {/* Grid */}
        {favProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <div
              className="w-20 h-20 rounded-[28px] flex items-center justify-center"
              style={{ background: 'rgba(248,113,113,0.10)' }}
            >
              <HugeiconsIcon icon={FavouriteIcon} size={36} color="rgba(248,113,113,0.60)" />
            </div>
            <p className="text-[18px] font-bold text-foreground tracking-tight">Избранное пусто</p>
            <p className="text-[14px] text-muted-foreground text-center max-w-[220px]">
              Нажмите на сердечко на странице товара, чтобы добавить его сюда
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 gap-3"
          >
            {favProducts.map((product) => (
              <motion.button
                key={product.id}
                variants={cardVariants}
                onClick={() => onProductClick(product)}
                className="bg-muted rounded-[26px] p-3 flex flex-col gap-3 text-left w-full"
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative h-[132px] rounded-[20px] overflow-hidden bg-card p-2 w-full">
                  <img
                    src={product.imageSrc}
                    alt={product.title}
                    className="w-full h-full object-cover rounded-[16px]"
                  />
                  {product.discount && (
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded-full text-[11px] font-bold"
                      style={{ background: 'rgba(46,139,87,0.12)', color: '#2e8b57' }}
                    >
                      {product.discount}
                    </div>
                  )}
                  {/* Favorite indicator */}
                  <div
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(255,255,255,0.94)' }}
                  >
                    <HugeiconsIcon icon={FavouriteIcon} size={14} color="#f06b6b" style={{ fill: '#f06b6b' }} />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <p className="text-[16px] font-bold text-foreground truncate tracking-tight">{product.title}</p>
                  <p className="text-[13px] font-medium text-muted-foreground truncate">{product.weight}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <p className="text-[17px] font-bold text-foreground leading-tight">{product.price} ₽</p>
                    {product.oldPrice && (
                      <p className="text-[12px] font-medium text-muted-foreground line-through">{product.oldPrice} ₽</p>
                    )}
                  </div>
                  <motion.div
                    onClick={(e) => { e.stopPropagation(); onAddToCart(product.id) }}
                    className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shrink-0"
                    whileTap={{ scale: 0.85 }}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} size={18} color="#ffffff" strokeWidth={2.5} />
                  </motion.div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
