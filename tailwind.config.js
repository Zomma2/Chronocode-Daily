/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '60%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out both',
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'popIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slideInRight 0.45s cubic-bezier(0.16,1,0.3,1) both',
        shimmer: 'shimmer 1.6s infinite linear',
      },
    },
  },
  plugins: [],
};
