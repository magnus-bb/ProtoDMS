<template>
	<li>
		<NuxtLink
			v-if="navigation"
			class="gap-2 btn btn-sm btn-ghost no-animation"
			:to="`/folders/${folder.id}`"
		>
			<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
		</NuxtLink>
		<span
			v-else
			class="gap-2 btn btn-sm btn-ghost no-animation"
			:class="{ 'btn-disabled': disableFolder, 'text-primary': highlightFolder?.id === folder.id }"
			@click="emit('select', folder)"
		>
			<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
		</span>

		<ul v-if="folder.children?.length" class="ml-4">
			<Folder
				v-for="child of folder.children"
				:key="child.id"
				:navigation="navigation"
				:folder="child"
				:disable-folders="disableFolders"
				:highlight-folder="highlightFolder"
				@select="emit('select', $event)"
			/>
		</ul>
	</li>
</template>

<script setup lang="ts">
import type { TreeFolder } from '@/types/files'
import type { DirectusFolders as DirectusFolder } from '@/types/directus'

const {
	folder,
	navigation = false,
	disableFolders = null,
	highlightFolder = null,
} = defineProps<{
	folder: TreeFolder
	navigation?: boolean // turn on to display as navigable links, off to just emit selected folder
	disableFolders?: DirectusFolder[] | null // if you want to disable and mute a specific folder (e.g. the current folder, so you can't select it) or several folders (parents and children of folder etc)
	highlightFolder?: DirectusFolder | null // if you want to indiciate the current folder in the tree etc
}>()

const emit = defineEmits<{
	(e: 'select', folder: TreeFolder): void
}>()

const disableFolder = $computed<boolean>(() => {
	// If disableFolders is null, don't add disabled class
	if (!disableFolders?.length) return false

	// If disableFolders is array of folders, check if the current folder is in that array (by checking ids)
	return disableFolders.some(f => f.id === folder.id)
})
</script>

<style lang="postcss" scoped>
.router-link-exact-active,
.btn-disabled {
	.folder-icon {
		--fill: 1;
	}
}
</style>
