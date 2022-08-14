module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended', // Sets vue-specific rules, with opinionated defaults (essential -> strongly-recommended -> recommended is order of opinionatedness) (eslint-plugin-vue)
		'@nuxtjs/eslint-config-typescript', // Comes with nuxt
		'prettier', // Disables other rules that might conflict with prettier (eslint-config-prettier)
	],
	plugins: ['prettier'], // Uses prettier rules as eslint rules (eslint-plugin-prettier)
	rules: {
		'@typescript-eslint/no-unused-vars': ['warn'],
		'prettier/prettier': 1, // Prettier rules are set to warnings but will be autofixed
	},
}
