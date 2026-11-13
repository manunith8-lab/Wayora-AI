/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f5',
          100: '#dceee9',
          200: '#badcd3',
          300: '#8ec3b7',
          400: '#5da497',
          500: '#3d887b',
          600: '#2c6d62',
          700: '#22564f',
          800: '#1c4640',
          900: '#123C36', // Primary Deep Forest Green
          950: '#0a2320',
        },
        gold: {
          50: '#fdf9f2',
          100: '#faf1e1',
          200: '#f3e1bf',
          300: '#eacb96',
          400: '#e0b26f',
          500: '#D9A86C', // Secondary Warm Sand Gold
          600: '#c58d51',
          700: '#a36f3e',
          800: '#835836',
          900: '#6c492f',
        },
        ivory: '#F7F5EF', // Background Soft Ivory
        charcoal: '#263A43', // Text Slate Charcoal
        sage: '#A9C6B5', // Secondary Accent Sage Green
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(18, 60, 54, 0.08)',
        'card': '0 10px 30px -5px rgba(18, 60, 54, 0.06)',
        'floating': '0 20px 40px -10px rgba(18, 60, 54, 0.15)',
      }
    },
  },
  plugins: [],
}
