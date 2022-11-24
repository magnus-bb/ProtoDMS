<template>
	<!-- BREADCRUMBS WITH PATH (DAISYUI) -->

	<Teleport to="#sidebarContent">
		<ul>
			<Folder :folder="rootFolder" />
		</ul>
	</Teleport>

	<!-- BUTTON TO SELECT FOLDER -->
	<!-- <label for="sidebar" class="btn btn-primary drawer-button lg:hidden">Open sidebar</label> -->
</template>

<script setup lang="ts">
import type { DirectusFolders as Folder } from '@/types/directus'
import type { TreeFolder } from '@/types/files'

definePageMeta({
	layout: 'sidebar',
})

const folderId = getCurrentFolderId()

const directus = useDirectus()

const { directusUrl } = useRuntimeConfig().public

// Do a spinner (nuxt-template style) while getting these with useLazyAsyncData
// it is important to use useDirectus so we get auth headers
const { data: allFolders } = await directus<{ data: Folder[] }>(directusUrl + 'folders')

const rootFolder = $ref<TreeFolder>(createDirectoryTree(allFolders))

// Go through all folders from directus and use the 'parent' id property to attach
// folders to their parent folders in a 'children' array
function createDirectoryTree(folders: TreeFolder[]): TreeFolder {
	for (const folder of folders) {
		const { parent: parentId } = folder

		// No parent means Root folder
		if (!parent) continue

		// Find parent folder
		const parentFolder = folders.find(folder => folder.id === parentId)

		// If for some reason the parent does not exist, skip
		if (!parentFolder) continue

		if (!Array.isArray(parentFolder.children)) {
			parentFolder.children = [folder]
		} else {
			parentFolder.children.push(folder)
		}
	}

	return folders.find(folder => !folder.parent) as TreeFolder // hacky to cast, but we know it will always find a root folder
}

/*
Since this is a catch-all-route, we might either be in /folders, /folders/:id, or /folders/:id/:whatever
If we are in /folders, this returns undefined
If we are in /folders/:id or a subpath, this returns the id, which is the first element of the useRoute().params.id array
*/
function getCurrentFolderId(): string | undefined {
	const {
		params: { id: folderId },
	} = useRoute()

	return folderId[0] // will be undef or the first route param after /folders
}
</script>

<style lang="postcss" scoped></style>
