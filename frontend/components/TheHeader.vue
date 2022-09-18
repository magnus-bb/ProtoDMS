<template>
	<div class="navbar">
		<nav class="flex-1" aria-label="Home">
			<NuxtLink to="/" title="Home" class="btn btn-ghost normal-case text-xl">
				Should I Use?
			</NuxtLink>
		</nav>

		<div class="flex-none gap-6">
			<div class="form-control">
				<div class="input-group">
					<span>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
							/>
						</svg>
					</span>
					<input
						type="text"
						placeholder="Search…"
						class="input input-bordered bg-transparent"
					/>
				</div>
			</div>

			<ThemePicker />

			<!-- TODO: keyboard usage for nav (tab and arrow keys) -->
			<nav aria-label="Main" class="dropdown dropdown-end">
				<button class="btn btn-ghost">
					Go to
					<svg
						class="fill-current"
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
					>
						<path
							d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
						/>
					</svg>
				</button>
				<ul
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
				>
					<li><NuxtLink to="/">Home</NuxtLink></li>
					<li><NuxtLink to="/signin">Sign in</NuxtLink></li>
				</ul>
			</nav>

			<!-- <div v-if="user"> -->
			<div v-if="user && hasAvatar" class="avatar">
				<div class="w-14 mask mask-squircle">
					<img :src="getThumbnail(user?.avatar as string)" />
				</div>
			</div>
			<div v-else-if="user" class="avatar placeholder">
				<div
					class="bg-secondary text-secondary-content w-14 mask mask-squircle"
				>
					<span>{{ initials }}</span>
				</div>
			</div>
			<!-- </div> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Ref } from 'vue'
import type { DirectusUsers as DirectusUser } from '@/types/directus'

// useDirectusUser is just object | null, so we use the actual type instead
const user = useDirectusUser() as unknown as Ref<Partial<DirectusUser> | null>
const hasAvatar = computed<boolean>(() => !!user.value?.avatar)

const { getThumbnail } = useDirectusFiles()

const initials = computed<string>(() => {
	if (!user.value) {
		return '?'
	}

	if (user.value.last_name) {
		// If there is a last name, return first and last name initials (first name is required, so it will exist)
		return (user.value.first_name![0] + user.value.last_name[0]).toUpperCase()
	}

	return user.value.first_name![0].toUpperCase()
})
</script>
