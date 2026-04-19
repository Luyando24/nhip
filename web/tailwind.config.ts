import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F6E56', // Zambia National Teal
          light: '#1D9E75',
          dark: '#0B3D2E',
        },
        accent: {
          DEFAULT: '#E8A020', // Zambian Gold
          light: '#F8B642',
          dark: '#B87E18',
        },
        surface: {
          DEFAULT: '#F8FAFC',
          paper: '#FFFFFF',
          border: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(15, 110, 86, 0.08), 0 2px 8px -1px rgba(15, 110, 86, 0.04)',
      }
    },
  },
  plugins: [],
} satisfies Config
