interface CategoryCardProps {
  title: string
  imageSrc?: string
  gradient?: string
  onClick?: () => void
}

export default function CategoryCard({ title, imageSrc, gradient, onClick }: CategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full rounded-lg overflow-hidden aspect-[2/1] shadow-[0_4px_12px_rgba(0,0,0,0.05)] block"
      aria-label={title}
      style={!imageSrc ? { background: gradient } : undefined}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5">
        <h2 className="text-white text-2xl font-bold tracking-tight">{title}</h2>
      </div>
    </button>
  )
}
