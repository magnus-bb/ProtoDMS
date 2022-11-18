<template>
	<div class="dropdown dropdown-end">
		<Avatar :user="user" tabindex="0" class="cursor-pointer" />

		<ul
			tabindex="0"
			class="dropdown-content menu menu-compact p-2 mt-3 shadow bg-base-100 rounded-box w-max"
		>
			<li><NuxtLink>Profile</NuxtLink></li>
		</ul>
	</div>
</template>

<script setup lang="ts">
// TODO: outline on focus (mask seems like it removes it)
import type { DirectusUsers as User } from '@/types/directus'

const { user } = defineProps<{
	user: Partial<User>
}>()
</script>
