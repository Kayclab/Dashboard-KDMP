/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crimson: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#d22c3a', // Primary Vibrant Crimson
          600: '#aa161a', // Primary Deep Crimson
          700: '#8b1014',
          800: '#680c0f',
          900: '#480608',
        },
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#499667', // Fresh Forest Green
          500: '#2f7850',
          600: '#20524d', // Deep Pine / Evergreen
          700: '#19423e',
          800: '#13322f',
          900: '#0c211f',
        },
        slate: {
          850: '#151e2e',
          950: '#0a0f1d',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 25px -3px rgba(170, 22, 26, 0.1), 0 4px 6px -2px rgba(32, 82, 77, 0.05)',
        'forest-hover': '0 10px 25px -3px rgba(32, 82, 77, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
