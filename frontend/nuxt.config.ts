import { defineNuxtConfig } from 'nuxt'

const title = 'Should I Use? - What are the implications of my stack?'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	meta: {
		title,
	},

	ssr: true,

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

	modules: ['@nuxtjs/tailwindcss', 'nuxt-directus'],

	directus: { url: process.env.NUXT_DIRECTUS_URL },

	typescript: {
		strict: true,
		typeCheck: true,
		shim: false,
	},

	build: {
		postcss: {
			postcssOptions: {
				plugins: {
					'postcss-import': {}, // Makes sure @imports just embed the imported file into the importer (instead of requiring a separate request to fetch the other file)
					...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
				},
			},
		},
	},
})
