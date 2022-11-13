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
					<input type="text" placeholder="Search…" class="input input-bordered bg-transparent" />
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
						<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
					</svg>
				</button>
				<ul
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-max"
				>
					<li><NuxtLink to="/">Home</NuxtLink></li>
					<li><NuxtLink to="/signin">Sign in</NuxtLink></li>
				</ul>
			</nav>

			<ProfileMenu v-if="user" :user="user" />
		</div>
	</div>
</template>

<script setup lang="ts">
const user = useDirectusUser()
</script>
