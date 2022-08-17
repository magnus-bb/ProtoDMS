import { defineNuxtConfig } from 'nuxt'
import eslintPlugin from 'vite-plugin-eslint'

const title = 'Should I Use? - What are the implications of my stack?'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	meta: {
		title,
	},

	ssr: true,

	// These are automatically read from environment when prefixed with NUXT_
	runtimeConfig: {
		userEmail: 'example@example.com',
		userPassword: 'password',
	},

	modules: [
		'@nuxtjs/tailwindcss',
		'nuxt-directus',
		'@nuxtjs/google-fonts',
		'@nuxtjs/color-mode',
	],

	directus: { url: process.env.NUXT_DIRECTUS_URL },

	//* Icon font is downloaded manually into @/assets/fonts/
	// googleFonts: {
	// 	families: {
	// 		'Kantumruy Pro': true,
	// 		'Ubuntu Mono': {
	// 			wght: [400, 700],
	// 			ital: [400, 700],
	// 		},
	// 	},
	// 	prefetch: true,
	// 	preconnect: true,
	// 	preload: true,
	// 	download: true,
	// 	inject: true,
	// },

	colorMode: {
		fallback: 'dark',
		dataValue: 'theme', // Allows us to use DaisyUI data-theme
	},

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
		// typeCheck: true, We use eslint instead for type checking
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

	// Makes eslint show errors in browser
	vite: {
		vue: {
			reactivityTransform: true, // enables TypeScript props with default values
		},
		plugins: [
			eslintPlugin({
				// fix: true, // This also fixes files that you didn't open and save manually
				cache: true, // Caches lint results and uses it if each target file is not changed. Please mind that ESLint doesn’t clear the cache when you upgrade ESLint plugins. In that case, you have to remove the cache file manually
				emitWarning: false, // don't bother printing warnings, they will show in editor
			}),
		],
	},
})
