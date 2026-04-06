interface PromoBannerProps {
  title: string
  subtitle: string
  imageSrc: string
  imageAlt?: string
  onClick?: () => void
}

export default function PromoBanner({ title, subtitle, imageSrc, imageAlt = '', onClick }: PromoBannerProps) {
  return (
    <section className="px-4 pb-7">
      <button
        onClick={onClick}
        className="w-full text-left rounded-lg overflow-hidden relative min-h-[120px] flex items-center p-5"
        style={{ background: 'linear-gradient(135deg, #ffe8d6, #e3f2fd)' }}
        aria-label={`${title} — ${subtitle}`}
      >
        <div className="relative z-10 max-w-[65%]">
          <h2
            className="text-lg font-bold text-foreground leading-tight mb-1.5"
            dangerouslySetInnerHTML={{ __html: title.replace('\n', '<br/>') }}
          />
          <p className="text-[13px] font-medium text-[#555555]">{subtitle}</p>
        </div>
        <img
          src={imageSrc}
          alt={imageAlt}
          className="absolute right-[-10px] bottom-[-15px] w-[140px] h-[140px] object-cover z-0"
        />
      </button>
    </section>
  )
}
