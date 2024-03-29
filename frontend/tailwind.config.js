/** @type {import('tailwindcss').Config} */

// const defaultTheme = require('tailwindcss/defaultTheme')
// const colors = require('tailwindcss/colors')
// const plugin = require('tailwindcss/plugin')
// const customDaisyTheme = require('./daisyui-theme.js')
import defaultTheme from 'tailwindcss/defaultTheme'
import colors from 'tailwindcss/colors'
import plugin from 'tailwindcss/plugin'
import customDaisyTheme from './daisyui-theme'

// This file must be the vanilla js version for the tailwind vscode intellisense extension to work correctly
export default {
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
		plugin(({ addVariant }) => {
			addVariant('not-last', '&:not(:last-child)')
			addVariant('next', '& + *')
		}),
	],
	daisyui: {
		themes: [
			{
				dark: customDaisyTheme,
			},
			'winter',
		],
	},
}
