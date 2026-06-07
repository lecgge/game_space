/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'outfit', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          default: '#0a84ff',
          hover: '#0669d5',
          text: '#ffffff',
        },
        accent: {
          DEFAULT: '#fcd34d',
          muted: '#b45309',
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
