<template>
	<!-- BREADCRUMBS WITH PATH (DAISYUI) -->

	<Teleport to="#sidebarContent">
		<ul>
			<Folder :folder="rootFolder" />
		</ul>

		<button class="flex items-center gap-2 text-sm px-3 text-secondary" @click="createFolder">
			<Icon class="grade-200 weight-700 optical-size-40">add</Icon>
			New folder in current directory
		</button>
	</Teleport>

	<main class="p-4">
		<div class="flex items-center gap-x-4 flex-wrap-reverse">
			<DirectoryBreadcrumbs
				v-if="currentFolder && allFolders"
				:all-folders="allFolders"
				:current-folder="currentFolder"
			/>
			<!-- BUTTON TO SELECT FOLDER -->
			<label for="sidebar" class="btn btn-sm btn-secondary btn-outline drawer-button lg:hidden">
				Change directory
			</label>
		</div>

		<div v-if="currentFiles?.length" class="space-y-8 mt-4">
			<div class="file-grid">
				<File v-for="file of currentFiles" :key="file.id" :file="file" />
			</div>

			<div class="flex">
				<FileSelector name="upload-files" circle center size="lg" multiple @change="uploadFiles">
					<Icon class="folder-icon text-4xl optical-size-40 grade-100">upload</Icon>
				</FileSelector>
			</div>
		</div>

		<div v-else class="alert alert-info shadow-lg mt-4 max-w-md">
			<div class="w-full justify-between">
				<span class="flex gap-2 items-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						class="stroke-current flex-shrink-0 w-6 h-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					<span>There are no files here yet.</span>
				</span>

				<div class="flex-none">
					<FileSelector name="upload-files" multiple @change="uploadFiles">Upload</FileSelector>
				</div>
			</div>
		</div>
	</main>
</template>

<script setup lang="ts">
// TODO: custom context menu for delete, rename, move: https://dev.to/stackfindover/how-to-create-a-custom-right-click-menu-54h2
// use clickoutside to close menu
// TODO: move folders out into separate composable (useFolders)
// TODO: a spinner (nuxt-template style) while getting these with useLazyAsyncData

import type {
	DirectusFolders as DirectusFolder,
	DirectusFiles as DirectusFile,
} from '@/types/directus'
import type { TreeFolder } from '@/types/files'

definePageMeta({
	layout: 'sidebar',
})

//* FOLDER TREE FOR SIDEBAR
let allFolders: DirectusFolder[] = $ref([])
await refreshFolders()

async function refreshFolders() {
	const folderRes = await readAll<DirectusFolder>('directus_folders')

	allFolders = folderRes as DirectusFolder[] // This IS a folder array, if undef, something else broke anyway
}
const rootFolder = $computed<TreeFolder>(() => createDirectoryTree(allFolders))

// If we are not at a page with a folder id, we redirect to the root folder
if (!getCurrentFolderId()) {
	await navigateTo(`/folders/${rootFolder.id}`, {
		replace: true,
		redirectCode: 301,
	})
}
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
// This is the ID of the selected folder from the URL (if any is selected)
const folderId = getCurrentFolderId()

const currentFolder = $computed<DirectusFolder | undefined>(() =>
	allFolders.find(folder => folder.id === folderId)
)

/*
Since this is a catch-all-route, we might either be in /folders, /folders/:id, or /folders/:id/:whatever
If we are in /folders, this returns undefined
If we are in /folders/:id or a subpath, this returns the id, which is the first element of the useRoute().params.id array
*/
function getCurrentFolderId(): string {
	const {
		params: { id: folderId },
	} = useRoute()

	return folderId[0] // will be undef or the first route param after /folders
}

//* CREATE FOLDER
async function createFolder() {
	try {
		const directus = useDirectus()

		await directus.folders.createOne({
			name: 'New folder',
			parent: folderId || rootFolder.id,
		})

		await refreshFolders()
	} catch (err) {
		alert('There was an error loading directories')
		console.error(err)
	}
}

//* CURRENT FILES
let currentFiles = $ref<DirectusFile[]>([])
await refreshFiles()

async function refreshFiles() {
	if (!folderId) return

	currentFiles = await query<DirectusFile>('directus_files', {
		filter: {
			folder: {
				_eq: folderId,
			},
		},
		limit: -1,
	})
}

//* FILE UPLOAD
async function uploadFiles(event: Event) {
	const { files } = event.target as HTMLInputElement
	const { accessToken } = useUser()

	if (!files?.length || !accessToken.value) return

	const form = new FormData()

	// It is important to add files folder BEFORE the files
	for (const file of files) {
		form.append('folder', folderId)
		form.append('file', file)
	}

	// Send the upload request
	try {
		const directus = useDirectus()

		await directus.files.createOne(form) // createOne works fine when multiple are added to the form

		await refreshFiles()
	} catch (err) {
		alert('There was an error uploading files')
		console.error(err)
	}
}
</script>

<style lang="postcss" scoped>
.file-grid {
	@apply grid gap-6 grid-flow-row;

	/* 112px is the height of the mimetype icons and coincidentally fits pretty well */
	grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
}
</style>
