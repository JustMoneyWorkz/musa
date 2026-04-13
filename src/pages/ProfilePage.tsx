import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Settings01Icon,
  ShoppingBag01Icon,
  Location01Icon,
  CreditCardIcon,
  CustomerService01Icon,
  ArrowRight01Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons'

const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user

const USER = {
  name: tgUser
    ? [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ')
    : 'Пользователь',
  subtitle: tgUser?.username ? `@${tgUser.username}` : '',
  avatarSrc: tgUser?.photo_url ?? '',
}

const getFavCount = () => {
  try { return (JSON.parse(localStorage.getItem('musa_favorites') ?? '[]') as string[]).length } catch { return 0 }
}

const MENU_ITEMS = [
  {
    id: 'favorites',
    title: 'Избранное',
    subtitle: 'Сохранённые товары',
    icon: FavouriteIcon,
    iconBg: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
  },
  {
    id: 'orders',
    title: 'Мои заказы',
    subtitle: 'Последние и запланированные',
    icon: ShoppingBag01Icon,
    iconBg: 'linear-gradient(135deg, #0d8b56 0%, #0b6e43 100%)',
    badge: '3 новых',
  },
  {
    id: 'addresses',
    title: 'Адреса доставки',
    subtitle: 'Дом, офис и дача',
    icon: Location01Icon,
    iconBg: 'linear-gradient(135deg, #b84a1d 0%, #d9642a 100%)',
  },
  {
    id: 'payment',
    title: 'Способы оплаты',
    subtitle: 'Visa заканчивается на 2048',
    icon: CreditCardIcon,
    iconBg: 'linear-gradient(135deg, #5a22c8 0%, #7b3aed 100%)',
  },
  {
    id: 'support',
    title: 'Помощь и поддержка',
    subtitle: 'Чат о заказах и возвратах',
    icon: CustomerService01Icon,
    iconBg: 'linear-gradient(135deg, #234fc7 0%, #3368f0 100%)',
  },
]

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
}
const itemVariants = {
  hidden:   { opacity: 0, x: -14 },
  visible:  { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] } },
}

interface ProfilePageProps {
  onMenuClick?: (id: string) => void
}

export default function ProfilePage({ onMenuClick }: ProfilePageProps) {
  const [favCount, setFavCount] = useState(getFavCount)

  useEffect(() => {
    const sync = () => setFavCount(getFavCount())
    window.addEventListener('storage', sync)
    window.addEventListener('focus', sync)
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('focus', sync) }
  }, [])

  const STATS = [
    { value: '24', label: 'Заказов' },
    { value: String(favCount), label: 'Избранное' },
    { value: '8', label: 'Сохранено' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background pb-[110px]">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between px-5 pt-6 pb-4"
      >
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center" />
        <h1 className="text-lg font-bold text-foreground tracking-tighter">Профиль</h1>
        <motion.button
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          whileTap={{ scale: 0.88 }}
          aria-label="Настройки"
        >
          <HugeiconsIcon icon={Settings01Icon} size={18} color="#09090b" />
        </motion.button>
      </motion.div>

      <div className="px-5 flex flex-col gap-5">
        {/* Profile hero card */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl p-6 flex flex-col items-center text-center gap-3 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #09090b 0%, #2f3136 100%)' }}
        >
          <div
            className="absolute w-44 h-44 rounded-full pointer-events-none"
            style={{ right: -60, top: -70, background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 72%)' }}
          />
          <div className="w-24 h-24 rounded-full p-1 relative z-10 flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.16)' }}>
            {USER.avatarSrc ? (
              <img src={USER.avatarSrc} alt={USER.name} className="w-full h-full rounded-full object-cover block" />
            ) : (
              <span className="text-3xl font-bold text-white select-none">
                {USER.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tighter relative z-10">{USER.name}</h2>
          {USER.subtitle ? (
            <p className="text-[15px] font-medium relative z-10 truncate max-w-full" style={{ color: 'rgba(255,255,255,0.72)' }}>
              {USER.subtitle}
            </p>
          ) : null}
          <div className="w-full grid grid-cols-3 gap-2 mt-2 relative z-10">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl py-3 px-2 text-center" style={{ background: 'rgba(255,255,255,0.10)' }}>
                <p className="text-lg font-bold text-white mb-1">{s.value}</p>
                <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.72)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Active order card */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18 }}
          whileTap={{ scale: 0.97 }}
          className="w-full flex items-center justify-between gap-4 rounded-2xl p-5 text-left"
          style={{ background: 'linear-gradient(135deg, #0b7a43 0%, #2e8b57 100%)' }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium mb-1.5" style={{ color: 'rgba(255,255,255,0.72)' }}>Активный заказ</p>
            <h3 className="text-[19px] font-bold text-white tracking-tighter mb-2">Доставка органической корзины</h3>
            <p className="text-[14px] font-medium" style={{ color: 'rgba(255,255,255,0.76)' }}>Сегодня · 14:30</p>
          </div>
          <div className="shrink-0 rounded-[18px] px-4 py-2.5 text-sm font-bold text-white" style={{ background: 'rgba(255,255,255,0.16)' }}>
            Следить
          </div>
        </motion.button>

        {/* Account section */}
        <div>
          <h2 className="text-[22px] font-bold text-foreground tracking-tighter mb-1">Аккаунт</h2>
          <p className="text-[15px] font-medium text-muted-foreground mb-4">Заказы, адреса и платёжные данные</p>

          <motion.div variants={listVariants} initial="hidden" animate="visible" className="flex flex-col gap-3">
            {MENU_ITEMS.map(({ id, title, subtitle, icon, iconBg, badge }) => (
              <motion.button
                key={id}
                variants={itemVariants}
                whileTap={{ scale: 0.97 }}
                onClick={() => onMenuClick?.(id)}
                className="w-full flex items-center gap-3 rounded-[20px] p-4 bg-muted text-left"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                  <HugeiconsIcon icon={icon} size={22} color="#ffffff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-bold text-foreground tracking-tight truncate">{title}</p>
                  <p className="text-[14px] font-medium text-muted-foreground mt-0.5 truncate">{subtitle}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {badge && (
                    <span className="bg-background text-foreground rounded-full px-2.5 py-1.5 text-[12px] font-bold leading-none">
                      {badge}
                    </span>
                  )}
                  <HugeiconsIcon icon={ArrowRight01Icon} size={20} color="#9aa3ae" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
