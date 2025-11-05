/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./src/components/**/*.{js,ts,jsx,tsx}", // Added path for new components
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}
