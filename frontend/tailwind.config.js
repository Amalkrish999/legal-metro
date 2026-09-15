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
        primary: {
          DEFAULT: '#0B3D91', // Navy Blue
          light: '#1e54a8',
          dark: '#072b6b',
        },
        accent: {
          DEFAULT: '#FF9933', // Saffron/Amber
          light: '#ffb366',
          dark: '#e67300',
        },
        status: {
          success: '#10B981', // Green
          warning: '#F59E0B', // Amber
          error: '#EF4444',   // Red
        }
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
