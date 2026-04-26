import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { DEFAULT: '#e4dd3d', dim: '#b8b230' },
        teal: { DEFAULT: '#00a19b', dim: '#007a76', dark: '#005e5b' },
        void: '#05080f',
        base: '#080d18',
        surface: '#0c1420',
        card: '#101928',
        raised: '#141f30',
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        body: ['Geist', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
        sans: ['Geist', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        xl: '20px',
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease forwards',
        'pulse-teal': 'neural-pulse 2s ease-in-out infinite',
        'gold-shimmer': 'gold-shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config
