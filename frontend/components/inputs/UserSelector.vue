<template>
	<div>
		<div v-if="selectedUsers.length" class="avatar-group -space-x-5 cursor-default">
			<Avatar
				v-for="user of selectedUsers"
				:key="user.id"
				:user="user"
				:avatar-options="{ key: 'user-avatar' }"
				class="w-8 text-sm"
				avatar-class="border-2 border-primary"
			/>
		</div>
		<div class="dropdown w-full">
			<label tabindex="0" class="btn w-full">
				<slot />
				<Icon
					class="fill optical-size-24 grade-100 absolute right-4 self-center text-xl leading-none bg-transparent"
					aria-hidden
				>
					expand_more
				</Icon>
			</label>
			<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-200 rounded-box">
				<li v-for="user of options" :key="user.id" class="flex flex-row items-center gap-x-2">
					<button class="w-full" @click="toggleSelectedUser(user)">
						<input
							type="checkbox"
							:checked="selectedUsers.some(selUser => selUser.id === user.id)"
							class="checkbox checkbox-primary p-0"
							tabindex="-1"
						/>
						<Avatar
							:user="user"
							:avatar-options="{ key: 'user-avatar' }"
							class="w-8 text-sm"
							avatar-class="!rounded-full overflow-hidden p-0 border-2 border-secondary"
						/>
						{{ [user.first_name, user.last_name].filter(u => u).join(' ') }}
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { DirectusUsers as DirectusUser } from '@/types/directus'

const props = defineProps<{
	options: DirectusUser[]
	modelValue: DirectusUser[]
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', users: DirectusUser[]): void
}>()

const selectedUsers = useVModel(props, 'modelValue', emit)

function toggleSelectedUser(user: DirectusUser) {
	const userInSelectedUsersIndex = selectedUsers.value.findIndex(selUser => selUser.id === user.id)

	if (userInSelectedUsersIndex !== -1) {
		selectedUsers.value.splice(userInSelectedUsersIndex, 1)
	} else {
		selectedUsers.value.push(user)
	}
}
</script>
