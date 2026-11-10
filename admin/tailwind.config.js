/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gau: {
          primary: '#80501D',
          dark: '#593713',
          gold: '#D6A23A',
          cream: '#FAF6ED',
          white: '#FFFFFF',
          green: '#557B42',
          light: '#F8F7F3',
          border: '#E8E1D5',
          muted: '#6E675F'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    },
  },
  plugins: [],
}

