import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Home01Icon,
  GridViewIcon,
  ShoppingBasket03Icon,
  User03Icon,
} from '@hugeicons/core-free-icons'

type NavTab = 'home' | 'catalog' | 'favorites' | 'profile'

const NAV_ITEMS: { id: NavTab; icon: any }[] = [
  { id: 'home',      icon: Home01Icon },
  { id: 'catalog',   icon: GridViewIcon },
  { id: 'favorites', icon: ShoppingBasket03Icon },
  { id: 'profile',   icon: User03Icon },
]

interface BottomNavProps {
  active?: NavTab
  onNavigate?: (tab: NavTab) => void
  cartCount?: number
}

export default function BottomNav({ active = 'home', onNavigate, cartCount = 0 }: BottomNavProps) {
  return (
    <nav
      className="fixed left-6 right-6 z-50 flex justify-between items-center px-8 h-[68px] rounded-full bg-card"
      style={{
        bottom: 24,
        zIndex: 80,
        boxShadow: '0 4px 32px rgba(9,9,11,0.08), 0 1px 6px rgba(9,9,11,0.04)',
      }}
      aria-label="Навигация"
    >
      {NAV_ITEMS.map(({ id, icon }) => {
        const isActive = active === id
        const showBadge = id === 'favorites' && cartCount > 0

        return (
          <motion.button
            key={id}
            onClick={() => onNavigate?.(id)}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex items-center justify-center w-12 h-12"
            whileTap={{ scale: 0.82 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <HugeiconsIcon
              icon={icon}
              size={24}
              color={isActive ? '#2e8b57' : '#9aa3ae'}
              strokeWidth={isActive ? 2 : 1.5}
            />

            {/* Active dot */}
            {isActive && (
              <motion.span
                layoutId="nav-active-dot"
                className="absolute bottom-1.5 w-1 h-1 rounded-full"
                style={{ background: '#2e8b57' }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              />
            )}

            {/* Cart badge */}
            {showBadge && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none"
                style={{ border: '2px solid #ffffff' }}
              >
                {cartCount > 9 ? '9+' : cartCount}
              </motion.span>
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
