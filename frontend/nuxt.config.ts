import eslintPlugin from 'vite-plugin-eslint'

const isDev = process.env.NODE_ENV !== 'production'

const title = 'Thesis'
const description = 'SOME DESCRIPTION'
// const logoPath = ORIGIN + '/img/POPlogo-socials.png'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
	app: {
		head: {
			title,
			meta: [
				{ name: 'description', content: description },
				{ property: 'og:description', content: description },
				{ property: 'og:title', content: title },
				{ property: 'og:type', content: 'website' },
				// { property: 'og:image', content: logoPath },
				// {
				// 	property: 'og:url',
				// 	content: ORIGIN,
				// },
				{ name: 'twitter:card', content: 'summary_large_image' },
				{ name: 'twitter:title', content: title },
				{ name: 'twitter:description', content: description },
				// { name: 'twitter:image', content: logoPath },
			],
		},
	},

	ssr: false,

	// These are automatically read from environment when prefixed with NUXT_
	runtimeConfig: {
		public: {
			/* @ts-ignore */
			directusUrl: 'http://localhost:8055',
			authenticatedRoleId: '', // get field presets to work for new users instead of this
		},
	},

	modules: ['@nuxtjs/tailwindcss', '@nuxtjs/google-fonts', 'nuxt-socket-io', '@vueuse/nuxt'],

	io: {
		sockets: [
			{
				name: 'document-sync',
				default: true,
			},
		],
	},

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

	//* Icon font is downloaded manually into @/assets/fonts/
	googleFonts: {
		families: {
			// 'Kantumruy Pro': true,
			'Ubuntu Mono': [400, 600],
		},
		prefetch: true,
		preconnect: true,
		preload: true,
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
			'@/components/inputs',
			'@/components',
		],
	},

	typescript: {
		strict: true,
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

	vite: {
		vue: {
			reactivityTransform: true, // enables TypeScript props with default values
		},
		build: {
			sourcemap: true,
		},
		plugins: [
			// Makes eslint show errors in browser
			isDev
				? eslintPlugin({
						fix: true, // This also fixes files that you didn't open and save manually
						cache: true, // Caches lint results and uses it if each target file is not changed. Please mind that ESLint doesn’t clear the cache when you upgrade ESLint plugins. In that case, you have to remove the cache file manually
						emitWarning: false, // don't bother printing warnings, they will show in editor
				  })
				: null,
		],
	},
})
