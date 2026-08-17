/** @type {import('tailwindcss').Config} */
module.exports = {
  // Ajusta estas rutas según las carpetas donde tengas tu código (app, components, etc.)
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};