/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./composables/**/*.{js,ts}",
    "./plugins/**/*.{js,ts}",
    "./app.{js,ts,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require('@tailwindcss/line-clamp'),
    require("daisyui")
  ],
  // Use a class instead of 'prefers-color-scheme' to switch theme
  darkMode: 'class', // mostly so tailwind won't interfere with daisyui theme toggling
  daisyui: {
    themes: ['light', 'dark'],
    darkTheme: 'dark'
  }
}
