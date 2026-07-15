/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables switching between light, dark, and classic contrast
  theme: {
    extend: {
      colors: {
        // Custom premium brand colors
        brand: {
          light: '#fcfcfc',
          dark: '#121212',
          border: '#e4e4e7',
          gray: '#71717a'
        },
        // Bathhouse/Sauna Status Colors
        status: {
          free: '#10b981',     // Green
          active: '#ef4444',   // Red
          warning: '#f59e0b',  // Yellow
          cleaning: '#3b82f6'  // Blue
        }
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
