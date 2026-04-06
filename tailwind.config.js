/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: '#f7f7f8',
        foreground: '#1f2937',
        primary: {
          DEFAULT: '#2ea84a',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f3f4f6',
          foreground: '#9ca3af',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#111827',
        },
        border: '#00000014',
        destructive: {
          DEFAULT: '#fee2e2',
          foreground: '#991b1b',
        },
        accent: {
          DEFAULT: '#ffd166',
          foreground: '#3c2f00',
        },
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '20px',
        full: '9999px',
      },
    },
  },
  plugins: [],
}
