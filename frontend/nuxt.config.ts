import { defineNuxtConfig } from 'nuxt'
import eslintPlugin from 'vite-plugin-eslint'

const title = 'Should I Use?'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	meta: {
		title,
	},

	ssr: true,

	// These are automatically read from environment when prefixed with NUXT_
	runtimeConfig: {
		public: {
			directusUrl: 'http://localhost:8055',
			authenticatedRoleId: '', // get field presets to work for new users instead of this
			userEmail: 'example@example.com', // remove
			userPassword: 'password', // remove
		},
	},

	modules: [
		'@nuxtjs/tailwindcss',
		'nuxt-directus',
		'@nuxtjs/google-fonts',
		'@nuxtjs/color-mode',
	],

	hooks: {
		// Route /signup to the signin.vue page file for reuse
		'pages:extend'(pages) {
			pages.push({
				name: 'signup', // use this to render the signup version of the page
				path: '/signup',
				file: '@/pages/signin.vue',
			})
		},
	},

	directus: { url: process.env.NUXT_PUBLIC_DIRECTUS_URL },

	//* Icon font is downloaded manually into @/assets/fonts/
	googleFonts: {
		families: {
			// 'Kantumruy Pro': true,
			'Ubuntu Mono': [400, 600],
		},
		prefetch: true,
		preconnect: true,
		preload: true,
		// download: true,
		// inject: true,
	},

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
		server: {
			// hmr: {
			// 	protocol: 'ws',
			// 	host: 'localhost',
			// },
			// watch: {
			// 	usePolling: true,
			// },
		},
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
