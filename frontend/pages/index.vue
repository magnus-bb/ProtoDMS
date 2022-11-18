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
		try {
			await refreshLogin()
		} catch (err) {
			setAsyncDataError('Could not log in')
			return
		}

		// if (!user) {
		// 	const { userEmail, userPassword } = useRuntimeConfig().public
		// 	try {
		// 		await login({ email: userEmail, password: userPassword }) // these come from env, which obv. is not what we want going forward
		// 	} catch (err) {
		// 		setAsyncDataError('Could not log in')
		// 		return
		// 	}
		// }

		try {
			const posts = await readByQuery<Post[]>('posts')

			return posts
		} catch (err) {
			setAsyncDataError('Could not get posts')
		}
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
