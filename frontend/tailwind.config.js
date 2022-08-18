/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

// This file must be the vanilla js version for the tailwind vscode intellisense extension to work correctly
module.exports = {
	darkMode: ['class', '[data-theme="dark"]'],
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
			animation: {
				'spin-slow': 'spin 3s linear infinite',
			},
			transitionTimingFunction: {
				'in-bounce': 'cubic-bezier(.68,.11,.5,1.29)',
			},
			fontFamily: {
				// Add font overwrites here
				// sans: ['Kantumruy Pro', ...defaultTheme.fontFamily.sans],
				mono: ['Ubuntu Mono', ...defaultTheme.fontFamily.mono],
			},
			colors: {
				muted: colors.gray['500'],
			},
			//* Use daisy vars as class names (https://daisyui.com/docs/themes/#-5)
			borderRadius: {
				'daisy-box': 'var(--rounded-box)',
				'daisy-btn': 'var(--rounded-btn)',
				'daisy-badge': 'var(--rounded-badge)',
				'daisy-tab': 'var(--tab-radius)',
			},
			borderWidth: {
				'daisy-btn': 'var(--border-btn)',
				'daisy-tab': 'var(--tab-border)',
			},
			scale: {
				'daisy-btn-focus': 'var(--btn-focus-scale)',
			},
			transitionDuration: {
				'daisy-btn': 'var(--animation-btn)',
				'daisy-input': 'var(--animation-input)',
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('@tailwindcss/line-clamp'),
		require('daisyui'),
	],
	daisyui: {
		// themes: ['dark', 'light'],
		themes: [
			{
				dark: {
					...require('daisyui/src/colors/themes')['[data-theme=dark]'],
					primary: '#b44150',
					secondary: '#27E8BC',
					accent: '#8533e8',
					'secondary-content': '#191D24', // default 'neutral'
					// 'accent-content': '#fff',
					'base-content': '#C2C7D0',
				},
				light: {
					...require('daisyui/src/colors/themes')['[data-theme=light]'],
					primary: '#b44150', // brighten
					secondary: '#27E8BC', // darken? I hate it, but maybe find another version
					accent: '#8533e8',
					// 'secondary-content': '#191D24', // default 'neutral'
					'accent-content': '#fff', // default '-content' from primary, secondary, accent when it should be light
				},
			},
		],
		darkTheme: 'dark',
	},
}
