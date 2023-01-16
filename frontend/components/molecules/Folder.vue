<template>
	<li>
		<NuxtLink
			v-if="navigation"
			class="gap-2 btn btn-sm btn-ghost no-animation"
			:to="`/folders/${folder.id}`"
		>
			<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
		</NuxtLink>
		<span v-else class="gap-2 btn btn-sm btn-ghost no-animation" @click="emit('select', folder)">
			<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
		</span>

		<ul v-if="folder.children?.length" class="ml-4">
			<Folder
				v-for="child of folder.children"
				:key="child.id"
				:navigation="navigation"
				:folder="child"
				@select="emit('select', $event)"
			/>
		</ul>
	</li>
</template>

<script setup lang="ts">
import type { TreeFolder } from '@/types/files'

const { folder, navigation = false } = defineProps<{
	folder: TreeFolder
	navigation?: boolean // turn on to display as navigable links, off to just emit selected folder
}>()

const emit = defineEmits<{
	(e: 'select', folder: TreeFolder): void
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
