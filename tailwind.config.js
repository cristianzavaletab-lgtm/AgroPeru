/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // AGROPERÚ Design Tokens
        primary: {
          DEFAULT: '#16a34a',
          hover: '#15803d',
          dark: '#14532d',
          light: '#dcfce7',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        brand: {
          green: '#14532d',
          'green-light': '#16a34a',
          dark: '#0f172a',
        },
        semantic: {
          success: '#16a34a',
          warning: '#f59e0b',
          danger: '#dc2626',
          info: '#2563eb',
        },
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      },
      borderRadius: {
        'card': '0.75rem', // 12px
      },
      transitionDuration: {
        'fast': '150ms',
        'normal': '200ms',
      }
    },
  },
  plugins: [],
}
