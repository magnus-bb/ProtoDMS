<template>
	<main>
		<h1 class="text-4xl font-semibold">WELCOME</h1>
		<!-- <progress v-if="pending" class="progress" />
		<article v-for="document of documents" v-else :key="document.id" class="prose relative">
			<h1>{{ document.title }}</h1>
			<section v-html="document.content" />
		</article>

		<p v-if="error">{{ asyncDataErrorMessage }}</p> -->
	</main>
</template>

<script setup lang="ts">
// Directus collections are plural, so we just rename for ts semantics
// import type { Documents as Document } from '@/types/directus'

// const {
// 	data: documents,
// 	error,
// 	pending,
// } = await useLazyAsyncData<Document[] | undefined>(
// 	async () => {
// 		// Here we force refetching user, since we want to make sure we can await the result (which is not possible with useUser)
// 		try {
// 			await getUser()
// 		} catch (err) {
// 			setAsyncDataError('Could not get logged in user')
// 			return
// 		}
// 		return await readAll<Document>('documents')
// 	},
// 	{
// 		server: false,
// 	}
// )
// const asyncDataErrorMessage = useState('errorMessage')

// function setAsyncDataError(msg: string) {
// 	useState('errorMessage', () => msg)
// 	throw new Error(msg)
// }
</script>
