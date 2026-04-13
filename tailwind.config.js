/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        background:  '#f4f4f5',
        foreground:  '#09090b',
        card: {
          DEFAULT:    '#ffffff',
          foreground: '#09090b',
        },
        muted: {
          DEFAULT:    '#f1f5f9',
          foreground: '#71717a',
        },
        primary: {
          DEFAULT:    '#2e8b57',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT:    '#f59e0b',
          foreground: '#111827',
        },
        border: 'rgba(0,0,0,0.08)',
        destructive: {
          DEFAULT:    '#ef4444',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        sm:    '8px',
        md:    '12px',
        lg:    '16px',
        xl:    '24px',
        '2xl': '32px',
        full:  '9999px',
      },
      boxShadow: {
        card:  '0 4px 24px rgba(0,0,0,0.04)',
        'card-md': '0 8px 32px rgba(0,0,0,0.08)',
        nav:   '0 16px 32px rgba(9,9,11,0.25)',
        btn:   '0 4px 12px rgba(0,0,0,0.15)',
      },
    },
  },
  plugins: [],
}
