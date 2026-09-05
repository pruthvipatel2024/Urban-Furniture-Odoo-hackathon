/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          navy: '#0B2A4A',
          'navy-secondary': '#163B63',
          wood: '#C98232',
          'wood-light': '#E5B875',
        },
        canvas: {
          DEFAULT: '#FAFAF8',
          50: '#FFFFFF',
          100: '#FAFAF8',
          200: '#F3F4F6',
          300: '#E3E7EA',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          navy: '#EEF4F8',
          wood: '#F8F0E6',
        },
        border: {
          DEFAULT: '#E3E7EA',
          light: '#EEF2F5',
        },
        text: {
          primary: '#17212B',
          secondary: '#667482',
          muted: '#8A96A3',
        },
        success: {
          DEFAULT: '#18794E',
          surface: '#EAF7F0',
        },
        warning: {
          DEFAULT: '#B7791F',
          surface: '#FFF6DF',
        },
        error: {
          DEFAULT: '#B42318',
          surface: '#FDECEC',
        },
        info: {
          DEFAULT: '#245B86',
          surface: '#EAF3F9',
        },
        primary: {
          DEFAULT: '#0B2A4A',
          50: '#EEF4F8',
          100: '#D8E5EF',
          200: '#ADC6DC',
          300: '#7FA4C6',
          400: '#4F80AF',
          500: '#2A5D8F',
          600: '#163B63',
          700: '#0B2A4A',
          800: '#071B31',
          900: '#040F1D',
        },
        secondary: {
          DEFAULT: '#C98232',
          50: '#F8F0E6',
          100: '#F1DECB',
          200: '#E5B875',
          300: '#DBA35A',
          400: '#D28E3F',
          500: '#C98232',
          600: '#A96823',
          700: '#875118',
          800: '#643B0F',
          900: '#432609',
        },
      }
    },
  },
  plugins: [],
}
