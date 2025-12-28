/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'warm-bg': '#F5F3F2',
        'deep-brown': '#3E1A01',
        'uprock-yellow': '#FFE95A',
        'uprock-orange': '#FF6300',
        'glass-white': 'rgba(255, 255, 255, 0.75)',
        'glass-border': 'rgba(255, 255, 255, 0.5)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
    },
  },
  plugins: [],
}
