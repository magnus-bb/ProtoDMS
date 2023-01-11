<template>
	<main>
		<progress v-if="pending" class="progress" />
		<article v-for="post of posts" v-else :key="post.id" class="prose relative">
			<h1>{{ post.title }}</h1>
			<section v-html="post.content" /> <!-- eslint-disable-line -->
		</article>

		<p v-if="error">{{ asyncDataErrorMessage }}</p>
	</main>
</template>

<script setup lang="ts">
// Directus collections are plural, so we just rename for ts semantics
import type { Posts as Post } from '@/types/directus'

const {
	data: posts,
	error,
	pending,
} = await useLazyAsyncData<Post[] | undefined>(
	async () => {
		// Here we force refetching user, since we want to make sure we can await the result (which is not possible with useUser)
		try {
			await getUser()
		} catch (err) {
			setAsyncDataError('Could not get logged in user')
			return
		}
		return await readAll<Post>('posts')
	},
	{
		server: false,
	}
)
const asyncDataErrorMessage = useState('errorMessage')

function setAsyncDataError(msg: string) {
	useState('errorMessage', () => msg)
	throw new Error(msg)
}
</script>
