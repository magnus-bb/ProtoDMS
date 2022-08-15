<template>
	<main>
		<progress v-if="pending" class="progress" />
		<article v-for="post of posts" v-else :key="post.id" class="prose relative">
			<h1>{{ post.title }}</h1>
			<section v-html="post.content"></section> <!-- eslint-disable-line -->
		</article>
		<p v-if="error">{{ asyncDataErrorMessage }}</p>
	</main>
</template>

<script setup lang="ts">
// Directus collections are plural, so we just rename for ts semantics
import type { Posts as Post } from '@/types/directus'
const { login } = useDirectusAuth()
const { getItems } = useDirectusItems()

// Async data does not rerun correctly when refreshed
const {
	data: posts,
	error,
	pending,
} = await useLazyAsyncData<Post[]>(async () => {
	const user = useDirectusUser()
	const { userEmail, userPassword } = useRuntimeConfig()

	if (!user.value) {
		//! DEMO - we quickly login, if there is no logged in user
		try {
			await login({ email: userEmail, password: userPassword }) // these come from env, which obv. is not what we want going forward
		} catch (err) {
			setAsyncDataError('Could not log in')
		}
	}

	let posts!: Post[]
	try {
		posts = await getItems<Post>({
			collection: 'posts',
		})
	} catch (err) {
		setAsyncDataError('Could not get posts')
	}

	return posts
})

const asyncDataErrorMessage = useState('errorMessage')

function setAsyncDataError(msg: string) {
	useState('errorMessage', () => msg)
	throw new Error(msg)
}
</script>

<style lang="postcss" scoped></style>
