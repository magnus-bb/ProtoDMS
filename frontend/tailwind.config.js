/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme')
// import colors from 'tailwindcss/colors'

// This file must be the vanilla js version for the tailwind vscode intellisense extension to work correctly
module.exports = {
	content: [
		'./components/**/*.{js,vue,ts}',
		'./layouts/**/*.vue',
		'./pages/**/*.vue',
		'./composables/**/*.{js,ts}',
		'./plugins/**/*.{js,ts}',
		'./app.{js,ts,vue}',
	],
	theme: {
		screens: {
			xs: '475px',
			...defaultTheme.screens,
		},
		extend: {
			fontFamily: {
				// Add font overwrites here
				// example: sans: ['Kantumruy Pro', ...defaultTheme.fontFamily.sans],
				// example: mono: ['Ubuntu Mono', ...defaultTheme.fontFamily.mono],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/line-clamp'),
		require('daisyui'),
	],
	daisyui: {
		themes: ['dark', 'light'],
		darkTheme: 'dark',
	},
}
