<template>
	<div class="dropdown dropdown-end scrollbar">
		<div class="indicator">
			<span
				v-if="notifications?.length"
				class="indicator-item indicator-start badge badge-secondary badge-sm top-1 left-1 p-1"
				>{{ notifications?.length }}</span
			>
			<button class="btn btn-square btn-ghost">
				<Icon class="optical-size-48 fill text-4xl text-neutral-content">{{
					notifications?.length ? '&#xe7f7;' : '&#xe7f4;'
				}}</Icon>
			</button>
		</div>

		<ul
			tabindex="0"
			class="dropdown-content menu p-2 mt-3 shadow bg-base-200 rounded-box w-max max-h-96 overflow-y-auto flex-nowrap"
		>
			<!-- notifications come from directus in the order of latest to newest, so we just reverse them here -->
			<li
				v-for="notification of notifications"
				:key="notification.id"
				class="flex flex-row gap-1 items-center justify-between pr-2"
			>
				<NuxtLink class="flex flex-col items-start gap-2 grow">
					<span class="text-sm">{{ notification.subject }}</span>
					<span class="text-xs text-muted">
						{{ dateStringToRelativeTimestamp(notification.timestamp) }} by
						<span class="text-xs font-semibold">{{ notification.message }}</span>
					</span>
				</NuxtLink>
				<button
					class="btn btn-sm !btn-circle btn-ghost"
					@click="deleteNotification(notification.id)"
				>
					<Icon class="optical-size-20 weight-600">close</Icon>
				</button>
			</li>
			<li v-if="!notifications.length" class="pointer-events-none">
				<span class="text-sm">No new notifications</span>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type {
	DirectusNotifications as DirectusNotification,
	DirectusUsers as DirectusUser,
} from '@/types/directus'

import { TIME_UNITS, dateStringToRelativeTimestamp } from '@/utils/time'

const { user } = defineProps<{
	user: DirectusUser
}>()

//* GETTING NOTIFICATIONS
let notifications = $ref<DirectusNotification[]>([])

async function getNotifications() {
	if (!user) return

	const rawNotifications = await readAll<DirectusNotification>('directus_notifications')

	rawNotifications.reverse() // Directus returns notifications in the order of oldest to newest, so we reverse them here
	notifications = rawNotifications
}

getNotifications() // get initial notifications
const notificationLoop = setInterval(getNotifications, 30 * TIME_UNITS.second) // after 30 secs, get nots and keep doing it every 30s
onBeforeUnmount(() => {
	clearInterval(notificationLoop) // make sure we only ever have one loop running
})
//* DELETING NOTIFICATIONS
async function deleteNotification(id: number) {
	const directus = useDirectus()

	try {
		await directus.items('directus_notifications').deleteOne(id.toString())

		// TODO: this might just be removed when websocket updates the whole list of notifications on every change
		// Remove from local array of notifications
		notifications.splice(
			notifications.findIndex(not => not.id === id),
			1
		)
	} catch (err) {
		console.error(err)
	}
}
</script>
