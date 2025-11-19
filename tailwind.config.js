/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta basada en el logo de TuriCash
        turi: {
          green: {
            light: '#6EBF4A',
            dark: '#4C8C30',
          },
          blue: {
            light: '#4A90E2',
            dark: '#004A99',
          },
          orange: '#F5A623',
          snow: '#F0F4F8',
          stone: '#4A4A4A',
        }
      }
    },
  },
  plugins: [],
}