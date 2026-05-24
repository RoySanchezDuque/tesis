/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6EFFC',
          100: '#CCE0F9',
          200: '#99C1F3',
          300: '#66A2ED',
          400: '#3383E7',
          500: '#0F52BA', // Color principal
          600: '#0C42A9',
          700: '#093199',
          800: '#062188',
          900: '#031077',
        },
        success: {
          50: '#E8F6F1',
          100: '#D1EDE2',
          200: '#A3DBC5',
          300: '#75C9A9',
          400: '#47B78C',
          500: '#2E8B57', // Verde para sistemas óptimos
          600: '#25704F',
          700: '#1C5547',
          800: '#133A3F',
          900: '#0A1F37',
        },
        warning: {
          50: '#FEF9E7',
          100: '#FCF3CF',
          200: '#F9E79F',
          300: '#F7DC6F',
          400: '#F5D03F',
          500: '#F5B041', // Amarillo para alertas
          600: '#D68910',
          700: '#B7950B',
          800: '#9A7D0A',
          900: '#7D6608',
        },
        danger: {
          50: '#F9EBEA',
          100: '#F2D7D5',
          200: '#E6B0AA',
          300: '#D98880',
          400: '#CD6155',
          500: '#C0392B', // Rojo para estados críticos
          600: '#A93226',
          700: '#922B21',
          800: '#7B241C',
          900: '#641E16',
        },
        dark: {
          50: '#F2F3F4',
          100: '#E5E7E9',
          200: '#CCD1D1',
          300: '#B3B6B7',
          400: '#909497',
          500: '#717D7E',
          600: '#616A6B',
          700: '#4D5656',
          800: '#393E46',
          900: '#17202A', // Fondo oscuro
        }
      },
      fontFamily: {
        sans: ['Inter var', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};