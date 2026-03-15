/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange:   '#F97316',
          'orange-light': '#FB923C',
          'orange-dark':  '#EA580C',
          dark:     '#181818',
          'dark-2': '#222222',
          'dark-3': '#2A2A2A',
          'dark-4': '#333333',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      keyframes: {
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%':      { opacity: '1',   transform: 'scale(1.05)' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'spin-slow':   'spin-slow 3s linear infinite',
        'pulse-glow':  'pulse-glow 2s ease-in-out infinite',
        'fade-in-up':  'fade-in-up 0.6s ease-out both',
      },
      boxShadow: {
        'orange-glow': '0 0 40px rgba(249,115,22,0.25)',
        'orange-sm':   '0 0 15px rgba(249,115,22,0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
