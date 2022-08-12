import { defineNuxtConfig } from 'nuxt'

const title = 'Thesis Platform'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	meta: {
		title,
	},

	ssr: true, // SSR breaks setting theme from localstorage

	modules: ['@nuxtjs/tailwindcss'],

	css: ['@/assets/css/styles.css'],

	components: {
		dirs: [
			'@/components/organisms',
			'@/components/molecules',
			'@/components/atoms',
			'@/components/inputs',
			'@/components',
		],
	},
	typescript: {
		strict: true,
		typeCheck: true,
		shim: false
	},

	build: {
		postcss: {
			postcssOptions: {
				plugins: {
					'postcss-import': {}, // Makes sure @imports just embed the imported file into the importer (instead of requiring a separate request to fetch the other file)
					...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
				},
			},
		},
	},

})
