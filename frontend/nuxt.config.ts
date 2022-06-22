import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	ssr: false, // SSR breaks setting theme from localstorage

	typescript: {
		strict: true,
		typeCheck: true
	},

	build: {
		postcss: {
			postcssOptions: {
				plugins: {
					'postcss-import': {},
					'tailwindcss/nesting': {},
					tailwindcss: {},
					autoprefixer: {},
					...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
				},
			},
		},
	},

	css: ['@/assets/css/styles.css'],
})
