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
      colors: {
        ...colors,
        "neutral-400": "rgba(84, 84, 84, 1)",
        "neutral-700": "rgba(63, 63, 63, 1)",
        "yellow-regular": "rgba(231, 255, 87, 1)",
      },
      boxShadow: {
        "slot": "inset 4px -4px 4px rgba(255, 255, 255, 0.25), inset -10px 8px 24px rgba(0, 0, 0, 0.25), 2px -2px 4px rgba(255, 255, 255, 0.25) "
      }
    },
  },
  plugins: [
    // ...
  ]
}
