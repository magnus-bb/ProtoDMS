module.exports = {
	extends: [
		'eslint:recommended',
		'plugin:vue/vue3-recommended', // Sets vue-specific rules, with opinionated defaults (essential -> strongly-recommended -> recommended is order of opinionatedness) (eslint-plugin-vue)
		'@nuxtjs/eslint-config-typescript', // Comes with nuxt
		'prettier', // Disables other rules that might conflict with prettier (eslint-config-prettier)
	],
	plugins: ['prettier'], // Uses prettier rules as eslint rules (eslint-plugin-prettier)
	rules: {
		'@typescript-eslint/no-unused-vars': 1,
		'vue/no-unused-vars': 1,
		// The following two rules are required to ignore
		'no-use-before-define': 'off',
		'@typescript-eslint/no-use-before-define': [
			'error',
			{
				typedefs: false,
				enums: false,
				functions: false,
				classes: false,
			},
		],
		'import/no-named-as-default': 0, // with ts declarations, non-default exports can function as default, which this doesn't like
		'no-console': ['warn', { allow: ['warn', 'error'] }],
		'object-property-newline': [
			'error',
			{
				allowAllPropertiesOnSameLine: true,
			},
		],
		'vue/component-name-in-template-casing': ['warn', 'PascalCase'],
		'vue/multi-word-component-names': 0,
		'vue/no-multiple-template-root': 0,
		'vue/no-v-for-template-key': 0, // is allowed in vue 3
		'vue/no-v-for-template-key-on-child': 2, // keys should be set on templates in vue 3
		'prettier/prettier': 1, // Prettier rules are set to warnings but will be autofixed
		'vue/valid-template-root': 1, // just warn me if there is a component with no markup
		'vue/no-setup-props-destructure': 0, // reactivity transform allows us to destructure props
		'no-multiple-empty-lines': 'warn',
		'no-labels': ['error', { allowLoop: true }],
		camelcase: [
			'warn',
			{
				allow: [
					'first_name',
					'last_name',
					'filename_download',
					'tags_id',
					'confirm_password',
					'directus_users_id',
					'related_documents',
					'related_users',
					'related_files',
					'related_document_id',
					'user_id',
					'file_id',
					'document_id',
					'organizational_id',
					'phone_number',
					'date_end',
				],
			},
		],
	},
}
