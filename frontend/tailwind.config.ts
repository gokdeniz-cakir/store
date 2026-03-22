import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        parchment: {
          50: '#fcfbf8',
          100: '#f5f4ef',
          200: '#e8e5dc',
          300: '#d8d2c4',
        },
        ink: {
          900: '#1c1917',
          800: '#292524',
          500: '#78716c',
        },
        crimson: {
          700: '#7a2222',
          800: '#5c1717',
        },
        gold: {
          500: '#c5a059',
          600: '#a38241',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        book: '12px 12px 24px -10px rgba(0, 0, 0, 0.25)',
      },
      maxWidth: {
        content: '1440px',
      },
      letterSpacing: {
        announcement: '0.2em',
        nav: '0.15em',
        eyebrow: '0.3em',
      },
    },
  },
  plugins: [],
} satisfies Config
