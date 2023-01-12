/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
   theme: {
    extend: {
      width: {
        'container': 'min(1200px, 100% - 2rem)',
      },
    },
  },
  plugins: [
    // ...
  ]
}
