/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        scouts: {
          blue: '#1E3A8A',      // Dark blue primary
          'blue-dark': '#1E40AF', // Darker blue variant
          'blue-light': '#3B82F6', // Lighter blue variant
          white: '#FFFFFF',      // White
          gray: '#6B7280',       // Gray for text
        }
      }
    },
  },
  plugins: [],
}
