<template>
	<main>
		<article class="prose">
			<h1>Hey</h1>
			<p>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Temporibus,
				aspernatur.
			</p>
			<h2>There</h2>
			<p class="line-clamp-5">
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias vero sunt
				aliquam incidunt ex vel, omnis nostrum accusamus, atque ad rerum
				pariatur voluptatibus nulla ipsum veniam perferendis porro maxime? Vero
				error harum maiores, cum suscipit eaque aspernatur sit repellat dolores
				sapiente eum quasi minima hic maxime sequi? Illum, porro! Quas saepe
				voluptate aperiam eaque totam perferendis! Dolor exercitationem aliquam
				veniam soluta, repellendus maxime numquam non sunt impedit corrupti sit
				illo quaerat autem quod nisi facere dolorum mollitia eaque esse ipsa nam
				sapiente labore nemo? Laboriosam libero nam, placeat alias quos quas
				recusandae dignissimos obcaecati, repellat, sint fugiat aspernatur saepe
				quasi.
			</p>
		</article>
	</main>
</template>

<script setup lang="ts">
import { Posts } from '@/types/directus'
const { login, logout } = useDirectusAuth()
const { getItems } = useDirectusItems()

try {
	await login({ email: 'example@example.com', password: 'asd!' })
} catch (err) {
	console.error(err)
}

// logout()

let posts: Posts[]

try {
	posts = await getItems<Posts>({
		collection: 'posts',
	})
	// console.log(posts)
} catch (err) {
	console.error(err)
}

function ok(func: (thing: string) => void) {
	func('abc')
}

const res: void = ok(text => console.log(text))

const wad: string = {
	abc: 'abc',
}
</script>

<style lang="postcss" scoped></style>
