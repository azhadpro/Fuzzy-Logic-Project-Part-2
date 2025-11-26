/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        ios: {
          bg: '#000000',
          card: '#1C1C1E',
          blue: '#0A84FF',
          gray: '#8E8E93',
          separator: '#38383A',
        },
      },
    },
  },
  plugins: [],
}