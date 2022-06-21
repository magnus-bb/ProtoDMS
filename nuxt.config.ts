import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	typescript: {
		strict: true,
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

	css: ['@/assets/css/tailwind.css', '@/assets/css/theme.css'],
})
