import { motion } from 'framer-motion'

interface CategoryCardProps {
  title: string
  imageSrc?: string
  gradient?: string
  onClick?: () => void
  index?: number
}

export default function CategoryCard({ title, imageSrc, gradient, onClick, index = 0 }: CategoryCardProps) {
  return (
    <motion.button
      onClick={onClick}
      className="relative w-full rounded-xl overflow-hidden aspect-[2/1] text-left block"
      style={{
        background: gradient ?? '#13151F',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
      aria-label={title}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.98 }}
    >
      {imageSrc && (
        <motion.img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.04 }}
          transition={{ duration: 0.4 }}
        />
      )}
      {/* Gradient overlay — reads dark → transparent from bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      {/* Subtle green glow at bottom edge */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(74,222,128,0.06) 0%, transparent 100%)' }}
      />
      <div className="absolute inset-0 flex items-end p-5">
        <h2 className="text-[22px] font-bold text-white tracking-tight leading-none">{title}</h2>
      </div>
    </motion.button>
  )
}
