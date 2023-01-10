<template>
	<li>
		<NuxtLink class="gap-2 btn btn-sm btn-ghost no-animation" :to="`/folders/${folder.id}`">
			<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
		</NuxtLink>

		<ul v-if="folder.children?.length" class="ml-4">
			<Folder v-for="child of folder.children" :key="child.id" :folder="child" />
		</ul>
	</li>
</template>

<script setup lang="ts">
import type { TreeFolder } from '@/types/files'

const { folder } = defineProps<{
	folder: TreeFolder
}>()
</script>

<style lang="postcss" scoped>
.router-link-exact-active {
	@apply text-primary;

	.folder-icon {
		--fill: 1;
	}
}
</style>
