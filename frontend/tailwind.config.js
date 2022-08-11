/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

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
    screens: {
			xs: '475px',
			...defaultTheme.screens,
		},
    extend: {
			fontFamily: { // Add font overwrites here
				// example: sans: ['Kantumruy Pro', ...defaultTheme.fontFamily.sans],
				// example: mono: ['Ubuntu Mono', ...defaultTheme.fontFamily.mono],
			},
		},
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
