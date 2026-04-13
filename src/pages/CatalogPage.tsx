import { motion } from 'framer-motion'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Leaf01Icon,
  Apple01Icon,
  MilkBottleIcon,
  CroissantIcon,
  GrapesIcon,
  NutIcon,
  SaladIcon,
  SparklesIcon,
} from '@hugeicons/core-free-icons'
import Header from '../components/Header'
import PromoBanner from '../components/PromoBanner'

const CATEGORIES = [
  {
    id: 'veggies',
    title: 'Овощи',
    subtitle: '120+ товаров',
    icon: Leaf01Icon,
    iconColor: '#4ade80',
    bg: 'linear-gradient(135deg, #113220 0%, #081a10 100%)',
    iconBg: 'rgba(74,222,128,0.15)',
  },
  {
    id: 'fruits',
    title: 'Фрукты',
    subtitle: '85+ товаров',
    icon: Apple01Icon,
    iconColor: '#f87171',
    bg: 'linear-gradient(135deg, #5c1217 0%, #2e060a 100%)',
    iconBg: 'rgba(248,113,113,0.15)',
  },
  {
    id: 'dairy',
    title: 'Молочное',
    subtitle: '40+ товаров',
    icon: MilkBottleIcon,
    iconColor: '#60a5fa',
    bg: 'linear-gradient(135deg, #152a4a 0%, #081224 100%)',
    iconBg: 'rgba(96,165,250,0.15)',
  },
  {
    id: 'bakery',
    title: 'Хлеб',
    subtitle: '30+ товаров',
    icon: CroissantIcon,
    iconColor: '#fbbf24',
    bg: 'linear-gradient(135deg, #663011 0%, #331505 100%)',
    iconBg: 'rgba(251,191,36,0.15)',
  },
  {
    id: 'berries',
    title: 'Ягоды',
    subtitle: '25+ товаров',
    icon: GrapesIcon,
    iconColor: '#c084fc',
    bg: 'linear-gradient(135deg, #3b0764 0%, #1a0330 100%)',
    iconBg: 'rgba(192,132,252,0.15)',
  },
  {
    id: 'nuts',
    title: 'Орехи',
    subtitle: '50+ товаров',
    icon: NutIcon,
    iconColor: '#fb923c',
    bg: 'linear-gradient(135deg, #431407 0%, #1c0a03 100%)',
    iconBg: 'rgba(251,146,60,0.15)',
  },
  {
    id: 'greens',
    title: 'Зелень',
    subtitle: '35+ товаров',
    icon: SaladIcon,
    iconColor: '#86efac',
    bg: 'linear-gradient(135deg, #052e16 0%, #021a0c 100%)',
    iconBg: 'rgba(134,239,172,0.15)',
  },
  {
    id: 'exotic',
    title: 'Экзотика',
    subtitle: 'Новинки',
    icon: SparklesIcon,
    iconColor: '#e879f9',
    bg: 'linear-gradient(135deg, #4a044e 0%, #1e001f 100%)',
    iconBg: 'rgba(232,121,249,0.15)',
  },
]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

interface CatalogPageProps {
  onBack?: () => void
}

export default function CatalogPage({ onBack: _onBack }: CatalogPageProps) {
  return (
    <div className="flex flex-col min-h-screen pb-[110px]">
      <Header showFilter />

      <div className="px-5 flex flex-col gap-6 pt-4">
        <PromoBanner
          tag="Выходные скидки"
          title={'Скидка 30% на\nорганические овощи'}
          imageSrc="https://storage.googleapis.com/banani-generated-images/generated-images/c41168ae-50aa-416a-9421-83dc72352372.jpg"
          imageAlt="Свежие овощи"
        />

        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tighter">Разделы</h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 gap-4"
        >
          {CATEGORIES.map(({ id, title, subtitle, icon, iconColor, bg, iconBg }) => (
            <motion.button
              key={id}
              variants={cardVariants}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl h-[140px] flex flex-col justify-between p-5 text-left overflow-hidden"
              style={{ background: bg }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: iconBg }}
              >
                <HugeiconsIcon icon={icon} size={22} color={iconColor} />
              </div>
              <div>
                <h3 className="text-[17px] font-semibold text-white leading-tight">{title}</h3>
                <p className="text-[13px] mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>{subtitle}</p>
              </div>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
