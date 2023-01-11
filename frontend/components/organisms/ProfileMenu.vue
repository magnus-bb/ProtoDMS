<template>
	<div class="dropdown dropdown-end">
		<Avatar v-if="user" :user="user" tabindex="0" class="cursor-pointer" />

		<ul
			tabindex="0"
			class="dropdown-content menu menu-compact p-2 mt-3 shadow bg-base-200 rounded-box w-max"
		>
			<li><NuxtLink>Profile</NuxtLink></li>
			<li><NuxtLink>Log out</NuxtLink></li>
		</ul>
	</div>
</template>

<script setup lang="ts">
// TODO: outline on focus (mask seems like it removes it)
import type { DirectusUsers as DirectusUser } from '@/types/directus'

const { user } = defineProps<{
	user: DirectusUser
}>()
</script>
