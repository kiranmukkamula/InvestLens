/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0b0f19', // Premium dark background
          card: 'rgba(20, 27, 45, 0.7)', // Sleek semi-transparent glass slate
          border: 'rgba(255, 255, 255, 0.08)',
          text: '#f8fafc', // Slate 50
          muted: '#94a3b8', // Slate 400
          green: '#10b981', // Emerald 500
          amber: '#f59e0b', // Amber 500
          red: '#ef4444' // Red 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(16, 185, 129, 0.15)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.15)',
        'glow-amber': '0 0 20px rgba(245, 158, 11, 0.15)',
      }
    },
  },
  plugins: [],
}
