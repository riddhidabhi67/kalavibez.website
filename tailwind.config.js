/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#FAF6EE',
          200: '#F5EDD9',
          300: '#EDE0C4',
          400: '#E2D0A8',
          500: '#D4BC8A',
        },
        champagne: {
          50: '#FBF8F0',
          100: '#F5EDD8',
          200: '#EDD9B0',
          300: '#E2C47E',
          400: '#D4A843',
          500: '#C49A2D',
          600: '#A07C1E',
          700: '#7C5F15',
        },
        warm: {
          50: '#FAF8F5',
          100: '#F2EDE5',
          200: '#E8DECE',
          300: '#D9CABF',
          400: '#C4B09A',
          500: '#A89278',
          600: '#8C7358',
          700: '#6E5740',
          800: '#4F3D2B',
          900: '#321F12',
        },
        gold: {
          100: '#FDF3DC',
          200: '#FAE4A8',
          300: '#F5CE65',
          400: '#EBB52E',
          500: '#C99513',
          600: '#9E7109',
          700: '#74520A',
        },
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'Georgia', 'serif'],
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.7s ease-out',
        'slide-in': 'slideIn 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 4px 32px rgba(180, 150, 80, 0.15), 0 1px 8px rgba(0,0,0,0.08)',
        'luxury-lg': '0 8px 48px rgba(180, 150, 80, 0.2), 0 2px 16px rgba(0,0,0,0.1)',
        'gold': '0 0 0 1px rgba(196, 152, 60, 0.3), 0 4px 24px rgba(196, 152, 60, 0.15)',
        'card': '0 2px 20px rgba(0,0,0,0.06), 0 1px 6px rgba(0,0,0,0.04)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.12), 0 2px 12px rgba(180, 150, 80, 0.15)',
      },
    },
  },
  plugins: [],
};
