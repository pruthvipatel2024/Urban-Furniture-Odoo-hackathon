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
        navy: {
          50: '#f0f4f9',
          100: '#e2ebf4',
          200: '#c5d8ea',
          300: '#99bcda',
          400: '#679cc6',
          500: '#4380b2',
          600: '#2f6696',
          700: '#26517a',
          800: '#1e3e62',
          900: '#132b4f',
          950: '#0b1329',
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
        },
        linen: {
          50: '#fdfbf7',
          100: '#faf5ea',
          200: '#f4ebd2',
          300: '#ecdcb3',
          400: '#e1c68f',
          500: '#d4a373',
          600: '#c58940',
        }
      }
    },
  },
  plugins: [],
}
