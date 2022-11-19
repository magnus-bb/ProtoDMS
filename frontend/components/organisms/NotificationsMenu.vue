<template>
	<div class="dropdown dropdown-end">
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

		<ul tabindex="0" class="dropdown-content menu p-2 mt-3 shadow bg-base-200 rounded-box w-max">
			<!-- notifications come from directus in the order of latest to newest, so we just reverse them here -->
			<li v-for="notification of notifications.reverse()" :key="notification.id">
				<NuxtLink class="flex flex-col items-start gap-1">
					<span class="text-sm">{{ notification.subject }}</span>
					<span class="text-xs text-muted">
						{{ dateStringToRelativeTimestamp(notification.timestamp) }} by
						<span class="text-xs font-semibold">{{ notification.message }}</span>
					</span>
				</NuxtLink>
			</li>
			<li v-if="!notifications.length" class="pointer-events-none">
				<span class="text-sm">No notifications</span>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { DirectusNotifications as Notification, DirectusUsers as User } from '@/types/directus'

const { user } = defineProps<{
	user: User
}>()

let notifications: Notification[] = []
if (user) {
	const { getNotifications } = useDirectusNotifications()
	notifications = (await getNotifications({ params: {} })) as Notification[]
}

const UNITS: Record<string, number> = {
	year: 24 * 60 * 60 * 1000 * 365,
	month: (24 * 60 * 60 * 1000 * 365) / 12,
	day: 24 * 60 * 60 * 1000,
	hour: 60 * 60 * 1000,
	minute: 60 * 1000,
	second: 1000,
}

function dateStringToRelativeTimestamp(
	dateString: string | undefined,
	relativeTo: number = Date.now()
): string {
	if (!dateString) return ''

	const rtf = new Intl.RelativeTimeFormat()

	const date = Date.parse(dateString)

	const elapsed = date - relativeTo

	// "Math.abs" accounts for both "past" & "future" scenarios
	for (const unit in UNITS) {
		if (Math.abs(elapsed) > UNITS[unit] || unit === 'second') {
			return rtf.format(Math.round(elapsed / UNITS[unit]), unit as Intl.RelativeTimeFormatUnit)
		}
	}

	return ''
}
</script>
