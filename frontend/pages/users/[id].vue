<template>
	<Teleport to="#sidebar-content">
		<div>
			<h2 class="text-2xl font-semibold">Related documents</h2>
			<div v-if="relatedDocuments.length" class="flex flex-wrap gap-2 mt-2">
				<NuxtLink
					v-for="relDoc of relatedDocuments"
					:key="relDoc.id"
					class="badge badge-lg badge-base-200"
					target="_blank"
					:to="`/documents/${relDoc.id}`"
				>
					{{ relDoc.title }}
				</NuxtLink>
			</div>
			<p v-else class="text-lg font-light italic">No related documents</p>
		</div>
		<div>
			<h2 class="text-2xl font-semibold">Subscribed to</h2>
			<div v-if="subscriptions.length" class="flex flex-wrap gap-2 mt-2">
				<NuxtLink
					v-for="sub of subscriptions"
					:key="sub.id"
					class="badge badge-lg badge-base-200"
					target="_blank"
					:to="`/documents/${sub.id}`"
				>
					{{ sub.title }}
				</NuxtLink>
			</div>
			<p v-else class="text-lg font-light italic">No subscriptions</p>
		</div>
	</Teleport>

	<main class="row p-4 grid grid-cols-12 gap-8">
		<img
			v-if="avatarUrl"
			:src="avatarUrl"
			alt="User profile picture"
			class="col-span-12 aspect-square mask mask-squircle object-cover mx-auto w-full max-w-md"
		/>

		<div class="details-section col-span-12 mx-auto">
			<h2 class="[grid-area:name] justify-self-end font-bold text-3xl">{{ fullName }}</h2>
			<h3
				v-if="user.title"
				class="[grid-area:title] justify-self-end text-primary text-xl font-medium"
			>
				{{ user.title }}
			</h3>
			<h4
				v-if="user.location"
				class="[grid-area:location] justify-self-end text-xl flex items-center gap-x-2"
			>
				<Icon class="optical-size-24 grade-100" aria-hidden>location_on</Icon>
				{{ user.location }}
			</h4>

			<span v-if="user.organizational_id" class="[grid-area:id] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-700" aria-hidden>fingerprint</Icon>
				{{ user.organizational_id }}
			</span>

			<span v-if="user.email" class="[grid-area:email] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-300" aria-hidden>alternate_email</Icon>
				<a class="link link-accent" :href="`mailto:${user.email}`">
					{{ user.email }}
				</a>
			</span>

			<span v-if="user.phone_number" class="[grid-area:phone] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-300" aria-hidden>call</Icon>
				<a class="link link-accent" :href="`tel:${user.phone_number}`">{{ user.phone_number }}</a>
			</span>
		</div>

		<div class="col-span-12">
			{{ isOwnProfile }}
			<pre>{{ user }}</pre>
		</div>
	</main>
</template>

<script setup lang="ts">
import type { Documents as Document } from '@/types/directus'
definePageMeta({
	layout: 'sidebar',
})

const {
	params: { id: userId },
} = useRoute()

const isOwnProfile = $computed<boolean>(() => userId === 'me')

//* USER INFORMATION
const user = await getUserData(userId as string) // when userId is 'me', it works perfectly fine since Directus uses the route /users/me as well

const avatarUrl = $computed<string | undefined>(() => {
	if (!user.avatar) return
	return getAssetUrl(user.avatar as string)
})

const fullName = $computed<string>(() => {
	return [user?.first_name, user?.last_name].filter(name => name).join(' ')
})

//* RELATIONAL INFORMATION
const relatedDocuments = $computed<Document[]>(() => {
	// Since some related documents can be private, and a user can technically be related to a private doc they can't see, we need to filter out the null values here
	return user?.related_documents?.map(rel => rel.document_id as Document).filter(doc => doc) ?? []
})

const subscriptions = $computed<Document[]>(() => {
	// Since some related documents can be private, and a user can technically be subscribed to a private doc they can't see, we need to filter out the null values here
	return user?.subscriptions?.map(rel => rel.documents_id as Document).filter(doc => doc) ?? []
})
</script>

<style lang="postcss">
.details-section {
	@apply grid grid-cols-2 grid-rows-3 gap-x-8 gap-y-1 items-center;

	/* stylelint-disable */
	grid-template-areas:
		'name	id'
		'title email'
		'location phone';
}
</style>
