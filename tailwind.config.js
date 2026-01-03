/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB', // blue-600
        background: {
          light: '#FFFFFF',
          dark: '#0F172A', // slate-900
        },
        surface: {
          light: '#F8FAFC', // slate-50
          dark: '#1E293B', // slate-800
        }
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
