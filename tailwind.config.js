/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA', // ultra light gray
        foreground: '#0F172A', // rich dark slate
        primary: {
          DEFAULT: '#6366F1', // vibrant indigo
          light: '#818CF8',
          dark: '#4338CA',
        },
        secondary: {
          DEFAULT: '#F59E0B', // premium warm amber
          light: '#FBBF24',
          dark: '#D97706',
        },
        accent: '#10B981', // vibrant emerald
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
      },
      boxShadow: {
        'premium': '0 20px 40px -15px rgba(0,0,0,0.1)',
        'premium-hover': '0 25px 50px -12px rgba(99, 102, 241, 0.25)',
      }
    },
  },
  plugins: [],
}
