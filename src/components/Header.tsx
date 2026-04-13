import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import { Search01Icon, FilterHorizontalIcon, Cancel01Icon } from '@hugeicons/core-free-icons'

interface HeaderProps {
  greeting?: string
  name?: string
  avatarSrc?: string
  showFilter?: boolean
  onFilterClick?: () => void
  onSearchChange?: (q: string) => void
}

export default function Header({
  greeting = 'Доброе утро 👋',
  name = 'Магазин Муса',
  avatarSrc = 'https://storage.googleapis.com/banani-avatars/avatar%2Fmale%2F25-35%2FEuropean%2F2',
  showFilter = false,
  onFilterClick,
  onSearchChange,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const openSearch = () => setIsOpen(true)

  const closeSearch = () => {
    setIsOpen(false)
    setQuery('')
    onSearchChange?.('')
  }

  const handleChange = (v: string) => {
    setQuery(v)
    onSearchChange?.(v)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex flex-col gap-5 px-5 pt-6 pb-2"
    >
      {/* Top row: greeting + avatar */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            key="header-top"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center justify-between overflow-hidden"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
              <h1 className="text-xl font-bold text-foreground tracking-tighter">{name}</h1>
            </div>
            <motion.img
              src={avatarSrc}
              alt="Профиль"
              className="w-11 h-11 rounded-full object-cover"
              whileTap={{ scale: 0.92 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search bar */}
      <motion.div
        layout
        className="flex items-center gap-3 h-14 rounded-full bg-card overflow-hidden"
        style={{
          paddingLeft: 20,
          paddingRight: isOpen ? 8 : showFilter ? 8 : 20,
          boxShadow: '0 2px 16px rgba(9,9,11,0.07)',
        }}
      >
        <motion.div animate={{ color: isOpen ? '#2e8b57' : '#9aa3ae' }} transition={{ duration: 0.2 }}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={isOpen ? '#2e8b57' : '#9aa3ae'} />
        </motion.div>

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.input
              key="input"
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.18 }}
              autoFocus
              value={query}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={closeSearch}
              placeholder="Введите название..."
              className="flex-1 bg-transparent text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
            />
          ) : (
            <motion.button
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              onClick={openSearch}
              className="flex-1 text-left text-[15px] font-medium text-muted-foreground"
            >
              Поиск свежих продуктов...
            </motion.button>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.button
              key="close-btn"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={closeSearch}
              className="w-10 h-10 flex items-center justify-center shrink-0"
              whileTap={{ scale: 0.85 }}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={18} color="#9aa3ae" />
            </motion.button>
          ) : showFilter ? (
            <motion.div
              key="filter-btn"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => { e.stopPropagation(); onFilterClick?.() }}
              className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center shrink-0 cursor-pointer"
              whileTap={{ scale: 0.88 }}
            >
              <HugeiconsIcon icon={FilterHorizontalIcon} size={18} color="#ffffff" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
