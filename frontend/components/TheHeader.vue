<template>
	<div class="navbar shadow-xl bg-base-300 mb-4 min-h-[80px]">
		<nav class="navbar-start hidden xs:flex" aria-label="Home">
			<NuxtLink
				to="/"
				title="Home"
				class="btn btn-ghost normal-case text-2xl md:text-4xl tracking-wider font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent"
			>
				ProtoDMS
			</NuxtLink>
		</nav>

		<div class="flex-none gap-6 navbar-center">
			<!-- TODO: keyboard usage for nav (tab and arrow keys) -->
			<nav aria-label="Main">
				<div class="dropdown dropdown-end md:hidden">
					<button class="btn btn-ghost text-3xl">
						<Icon>menu</Icon>
					</button>
					<ul class="mt-3 p-2 shadow menu dropdown-content bg-base-200 rounded-box w-max text-2xl">
						<li>
							<NuxtLink to="/" title="Home" active-class="active btn-disabled">
								<Icon>home</Icon>
							</NuxtLink>
						</li>
						<li v-if="user">
							<NuxtLink to="/documents" title="Documents" active-class="active btn-disabled"
								><Icon>description</Icon></NuxtLink
							>
						</li>
						<li v-if="user">
							<NuxtLink
								to="/folders"
								title="Files"
								:class="{ 'active btn-disabled': route.name === 'folders-id' }"
							>
								<Icon>perm_media</Icon>
							</NuxtLink>
						</li>
					</ul>
				</div>

				<ul class="hidden md:menu md:menu-horizontal rounded-box bg-base-100 text-2xl">
					<li>
						<NuxtLink to="/" title="Home" active-class="active btn-disabled"
							><Icon>home</Icon></NuxtLink
						>
					</li>
					<li v-if="user">
						<NuxtLink to="/documents" title="Documents" active-class="active btn-disabled"
							><Icon>description</Icon></NuxtLink
						>
					</li>
					<li v-if="user">
						<NuxtLink
							to="/folders"
							title="Files"
							:class="{ 'active btn-disabled': route.name === 'folders-id' }"
							><Icon>perm_media</Icon></NuxtLink
						>
					</li>
				</ul>
			</nav>
		</div>
		<div class="navbar-end gap-x-4">
			<NotificationsMenu v-if="user" :user="user" />
			<ProfileMenu :user="user" />
		</div>
	</div>
</template>

<script setup lang="ts">
const { user } = useUser()
const route = useRoute()
</script>
