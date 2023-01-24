<template>
	<div v-if="user && avatarUrl" class="avatar">
		<div v-bind="$attrs">
			<img :src="avatarUrl" />
		</div>
	</div>
	<div v-else-if="user" class="avatar placeholder">
		<div class="bg-secondary text-secondary-content" v-bind="$attrs">
			<span>{{ initials }}</span>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DirectusUsers as DirectusUser } from '@/types/directus'
import type { DirectusImageOptions } from '@/composables/directus'

const { user, avatarOptions } = defineProps<{
	user: Partial<DirectusUser>
	avatarOptions?: DirectusImageOptions
}>()

const avatarUrl = $computed<string | void>(() => {
	if (!user.avatar) {
		return
	}

	return getAssetUrl(user.avatar as string, avatarOptions)
})

const initials = $computed<string>(() => {
	if (!user) {
		return '?'
	}

	if (user.last_name) {
		// If there is a last name, return first and last name initials (first name is required, so it will exist)
		return (user.first_name![0] + user.last_name[0]).toUpperCase()
	}

	return user.first_name![0].toUpperCase()
})
</script>

<script lang="ts">
export default {
	inheritAttrs: false,
}
</script>
