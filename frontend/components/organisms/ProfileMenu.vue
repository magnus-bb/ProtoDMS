<template>
	<div class="dropdown dropdown-end">
		<div class="indicator">
			<span
				v-if="notifications?.length"
				class="indicator-item indicator-start badge badge-secondary badge-sm top-1 left-1 p-1"
				>{{ notifications?.length }}</span
			>
			<Avatar :user="user" tabindex="0" class="cursor-pointer" />
		</div>

		<ul
			tabindex="0"
			class="dropdown-content menu menu-compact p-2 mt-3 shadow bg-base-100 rounded-box w-max"
		>
			<li><NuxtLink>Profile</NuxtLink></li>
			<li>
				<NuxtLink
					>Notifications
					<span v-if="notifications?.length" class="badge badge-xs badge-secondary">{{
						notifications?.length
					}}</span></NuxtLink
				>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
// TODO: outline on focus (mask seems like it removes it)
// TODO: show notifications
import type {
	DirectusUsers as DirectusUser,
	DirectusNotifications as DirectusNotification,
} from '@/types/directus'

const { getNotifications } = useDirectusNotifications()

const { user } = defineProps<{
	user: Partial<DirectusUser>
}>()

const notifications = await getNotifications<DirectusNotification[]>({ params: {} })
</script>
