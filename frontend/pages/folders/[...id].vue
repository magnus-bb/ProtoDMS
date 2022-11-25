<template>
	<!-- BREADCRUMBS WITH PATH (DAISYUI) -->

	<Teleport to="#sidebarContent">
		<ul>
			<Folder :folder="rootFolder" />
		</ul>
	</Teleport>

	<main class="p-4">
		<h1 v-if="currentFolder" class="text-4xl font-semibold">{{ currentFolder.name }}</h1>
		<div v-if="currentFiles?.length" class="file-grid mt-4">
			<File v-for="file of currentFiles" :key="file.id" :file="file" />
		</div>
	</main>

	<!-- BUTTON TO SELECT FOLDER -->
	<!-- <label for="sidebar" class="btn btn-primary drawer-button lg:hidden">Open sidebar</label> -->
</template>

<script setup lang="ts">
// TODO: default current folder to root folder
// TODO: custom context menu for delete, rename, move: https://dev.to/stackfindover/how-to-create-a-custom-right-click-menu-54h2
// use clickoutside to close menu

import type { DirectusFolders as Folder, DirectusFiles as File } from '@/types/directus'
import type { TreeFolder } from '@/types/files'

definePageMeta({
	layout: 'sidebar',
})

// TODO: move folders out into separate composable (useFolders)

//* FOLDER TREE FOR SIDEBAR
const { directusUrl } = useRuntimeConfig().public
const directus = useDirectus()

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

//* CURRENT FOLDER
// This be the ID of the selected folder from the URL (if any is selected)
const folderId = getCurrentFolderId()

const currentFolder = $computed<Folder | undefined>(() =>
	allFolders.find(folder => folder.id === folderId)
)

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

//* CURRENT FILES
const { getFiles } = useDirectusFiles()

const currentFiles = await getFiles<File>({
	params: {
		filter: {
			folder: folderId,
		},
	},
})
</script>

<style lang="postcss" scoped>
.file-grid {
	@apply grid gap-6 grid-flow-row;

	/* 112px is the height of the mimetype icons and coincidentally fits pretty well */
	grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
}
</style>
