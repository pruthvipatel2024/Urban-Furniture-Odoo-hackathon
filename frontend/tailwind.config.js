/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        canvas: {
          DEFAULT: '#FBFBFB',
          50: '#FFFFFF',
          100: '#FBFBFB',
          200: '#F3F4F6',
          300: '#E5E7EB',
        },
        primary: {
          DEFAULT: '#C6E7FF',
          50: '#F4FAFF',
          100: '#E6F4FF',
          200: '#C6E7FF',
          300: '#9BD5FF',
          400: '#64B9FF',
          500: '#3095EB',
          600: '#1B76C7',
          700: '#145B9D',
          800: '#10497D',
          900: '#0C375F',
        },
        secondary: {
          DEFAULT: '#D4F6FF',
          50: '#F7FDFF',
          100: '#EBFBFF',
          200: '#D4F6FF',
          300: '#ACEEFF',
          400: '#75DCFF',
          500: '#34C2F7',
          600: '#169FD4',
          700: '#117AA5',
          800: '#0E5F81',
          900: '#0B4761',
        },
        teak: {
          50: '#fbf7ee',
          100: '#f6ecda',
          200: '#ecdbb4',
          300: '#e1c385',
          400: '#d5a85c',
          500: '#c58940',
          600: '#b17034',
          700: '#93552d',
          800: '#78442a',
          900: '#633925',
          950: '#381d13',
        }
      }
    },
  },
  plugins: [],
}
