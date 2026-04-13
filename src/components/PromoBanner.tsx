import { motion } from 'framer-motion'

interface PromoBannerProps {
  tag?: string
  title: string
  imageSrc: string
  imageAlt?: string
  onClick?: () => void
}

export default function PromoBanner({ tag = 'Выходные скидки', title, imageSrc, imageAlt = '', onClick }: PromoBannerProps) {
  return (
    <motion.button
      onClick={onClick}
      className="w-full relative rounded-xl overflow-hidden h-[140px] text-left"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileTap={{ scale: 0.98 }}
      aria-label={title}
    >
      {/* Background image */}
      <img
        src={imageSrc}
        alt={imageAlt}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to right, rgba(9,9,11,0.92) 0%, rgba(9,9,11,0.45) 65%, transparent 100%)',
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-center px-6">
        <span
          className="text-[11px] font-bold uppercase tracking-widest text-white mb-2 px-2 py-1 rounded-lg w-fit"
          style={{ background: 'rgba(255,255,255,0.18)' }}
        >
          {tag}
        </span>
        <h3
          className="text-xl font-bold text-white leading-tight"
          dangerouslySetInnerHTML={{ __html: title.replace('\n', '<br/>') }}
        />
      </div>
    </motion.button>
  )
}
