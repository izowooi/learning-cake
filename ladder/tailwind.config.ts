import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd38c',
          300: '#fbc25f',
          400: '#fab53d',
          500: '#f9a825',
          600: '#f59621',
          700: '#ef7f1a',
          800: '#e96915',
          900: '#df440d',
        },
        ladder: {
          line: '#2d3748',
          highlight: '#e53e3e',
          bg: '#1a1a2e',
        }
      },
      animation: {
        'path-draw': 'pathDraw 2s ease-in-out forwards',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'bounce-in': 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards',
      },
      keyframes: {
        pathDraw: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config

