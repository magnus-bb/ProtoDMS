<template>
	<!-- BREADCRUMBS WITH PATH (DAISYUI) -->

	<Teleport to="#sidebarContent">
		<ul>
			<Folder navigation :folder="rootFolder" />
		</ul>

		<InputToggle class="px-3">
			<label for="new-folder" class="sr-only">Create new folder</label>
			<input
				id="new-folder"
				ref="createFolderInput"
				class="input input-xs w-full placeholder:text-muted"
				placeholder="Folder name"
				@keydown.enter="createFolderWithName(($event.target as HTMLInputElement).value)"
			/>

			<template #display>
				<button class="flex items-center gap-2 text-sm btn-xs text-secondary">
					<Icon class="grade-200 weight-700 optical-size-40">add</Icon>
					New folder in current directory
				</button>
			</template>
		</InputToggle>
	</Teleport>

	<div class="p-4 flex flex-col">
		<div class="flex items-center gap-x-4 flex-wrap-reverse">
			<DirectoryBreadcrumbs
				v-if="currentFolder && allFolders"
				:all-folders="allFolders"
				:current-folder="currentFolder"
				class="hidden sm:block"
			/>
			<!-- BUTTON TO SELECT FOLDER -->
			<label for="sidebar" class="btn btn-xs btn-secondary btn-outline drawer-button lg:hidden">
				Change directory
			</label>
		</div>

		<div class="flex justify-between gap-x-4">
			<InputToggle
				@show-input="initRenameFolderInputValue"
				@hide-input="renameFolderInputValue = ''"
			>
				<label for="renameFolder" class="sr-only">Rename folder</label>
				<input
					id="renameFolder"
					ref="renameFolderInput"
					v-model="renameFolderInputValue"
					class="input w-full max-w-lg placeholder:text-muted text-3xl"
					placeholder="Folder name"
					@keydown.enter="renameCurrentFolder"
				/>

				<template #display>
					<button
						title="Rename folder"
						class="flex items-center gap-4 px-0 text-xl sm:text-3xl font-semibold tracking-wide h-12"
					>
						<h1>{{ currentFolder?.name }}</h1>
						<Icon class="grade-200 weight-700 fill optical-size-40">drive_file_rename_outline</Icon>
					</button>
				</template>
			</InputToggle>

			<div class="flex gap-x-2">
				<!-- FILE ACTIONS -->
				<div v-if="selectedFiles.length" class="dropdown dropdown-hover">
					<button class="btn btn-secondary bg-secondary/50 border-none text-xl sm:text-2xl gap-x-1">
						<Icon class="weight-700 fill optical-size-40">{{
							selectedFiles.length === 1 ? 'draft' : 'file_copy'
						}}</Icon>
						<Icon class="weight-700 fill optical-size-40">arrow_drop_down</Icon>
					</button>

					<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-full">
						<!-- download file -->
						<li
							v-if="selectedFiles.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Download file(s)"
						>
							<NuxtLink
								target="_blank"
								:download="selectedFiles[0].filename_download"
								:to="fileDownloadUrl"
							>
								<Icon class="weight-700 fill optical-size-40">download</Icon>
							</NuxtLink>
						</li>
						<!-- rename file -->
						<li
							v-if="selectedFiles.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Rename file"
						>
							<span tabindex="0" @click="renameSelectedFile">
								<Icon class="weight-700 fill optical-size-40">edit_document</Icon>
							</span>
						</li>
						<!-- move files -->
						<li class="items-center text-xl sm:text-2xl">
							<label tabindex="0" title="Move file(s)" for="move-file-modal">
								<Icon class="weight-700 fill optical-size-40">drive_file_move</Icon>
							</label>
						</li>
						<!-- delete files -->
						<li class="items-center text-xl sm:text-2xl" title="Delete file(s)">
							<span tabindex="0" @click="deleteSelectedFiles">
								<Icon class="weight-700 fill optical-size-40 text-error">delete</Icon>
							</span>
						</li>
					</ul>
				</div>

				<!-- FOLDER ACTIONS -->
				<div class="dropdown dropdown-hover">
					<button class="btn text-xl sm:text-2xl gap-x-1">
						<Icon class="weight-700 fill optical-size-40">folder</Icon>
						<Icon class="weight-700 fill optical-size-40">arrow_drop_down</Icon>
					</button>

					<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-full">
						<!-- create folder -->
						<li
							class="items-center text-xl sm:text-2xl"
							title="Create folder"
							@click="createFolder"
						>
							<span tabindex="0">
								<Icon class="weight-700 fill optical-size-40">create_new_folder</Icon>
							</span>
						</li>
						<!-- move folder -->
						<li v-if="currentFolder !== rootFolder" class="items-center text-xl sm:text-2xl">
							<label tabindex="0" title="Move folder" for="move-folder-modal">
								<Icon class="weight-700 fill optical-size-40">drive_file_move</Icon>
							</label>
						</li>
						<!-- delete folder -->
						<li
							v-if="currentFolder !== rootFolder"
							class="items-center text-xl sm:text-2xl"
							title="Delete folder"
							@click="deleteCurrentFolder"
						>
							<span tabindex="0">
								<Icon class="weight-700 fill optical-size-40 text-error">folder_delete</Icon>
							</span>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="divider mb-8" />

		<main v-if="currentFiles?.length" class="space-y-8">
			<div class="file-grid">
				<File
					v-for="file of currentFiles"
					:key="file.id"
					:file="file"
					:selected="selectedFiles.includes(file)"
					@click="selectFile(file)"
				/>
			</div>

			<div class="flex">
				<FileSelector name="upload-files" circle center size="lg" multiple @change="uploadFiles">
					<Icon class="text-4xl fill optical-size-40 grade-100">upload</Icon>
				</FileSelector>
			</div>
		</main>

		<div v-else class="alert alert-info shadow-lg max-w-md">
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
	</div>

	<!-- Hacky to have two modals, but it is the easiest way when daisy's modals are all html and css -->
	<!-- TODO: rewrite so there is a single controller that reuses same modal but passes context of file / folder with js -->
	<!-- MOVE FILE MODAL -->
	<input id="move-file-modal" ref="moveFilesModal" type="checkbox" class="modal-toggle" />
	<label for="move-file-modal" class="modal">
		<label class="modal-box relative">
			<label for="move-file-modal" class="btn btn-sm btn-circle absolute right-2 top-2">
				<Icon class="text-xl optical-size-24 grade-100">close</Icon>
			</label>

			<h3 class="text-lg font-bold mb-4">Select where to move the selected files</h3>

			<ul>
				<Folder :folder="rootFolder" :disable-folder="currentFolder" @select="moveSelectedFiles" />
			</ul>
		</label>
	</label>

	<!-- MOVE FOLDER MODAL -->
	<input id="move-folder-modal" ref="moveFolderModal" type="checkbox" class="modal-toggle" />
	<label for="move-folder-modal" class="modal">
		<label class="modal-box relative">
			<label for="move-folder-modal" class="btn btn-sm btn-circle absolute right-2 top-2">
				<Icon class="text-xl optical-size-24 grade-100">close</Icon>
			</label>

			<h3 class="text-lg font-bold mb-4">Select where to move '{{ currentFolder?.name }}'</h3>

			<ul>
				<Folder :folder="rootFolder" :disable-folder="currentFolder" @select="moveCurrentFolder" />
			</ul>
		</label>
	</label>
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

//* CREATE FOLDER
function createFolder() {
	const name: string | null = prompt('Enter a name for the new folder')

	if (!name) return

	createFolderWithName(name)
}

async function createFolderWithName(name: string) {
	try {
		const directus = useDirectus()

		await directus.folders.createOne({
			name,
			parent: folderId || rootFolder.id,
		})

		await refreshFolders()
	} catch (err) {
		alert('There was an error loading directories')
		console.error(err)
	}
}
// Auto-focus the create folder input when it is shown
const createFolderInput = ref<HTMLInputElement>()
useFocus(createFolderInput, { initialValue: true })

//* RENAME FOLDER
const renameFolderInput = ref<HTMLInputElement>()
useFocus(renameFolderInput, { initialValue: true })

let renameFolderInputValue = $ref<string>('')

function initRenameFolderInputValue() {
	renameFolderInputValue = currentFolder?.name || ''
}

async function renameCurrentFolder() {
	try {
		const directus = useDirectus()

		if (!currentFolder?.id) {
			throw new Error('currentFolder is undefined')
		}

		await directus.folders.updateOne(currentFolder.id, {
			name: renameFolderInputValue,
		})
	} catch (err) {
		alert('There was an error renaming folder')
		console.error(err)
	}

	refreshFolders()
}

//* DELETE FOLDER
async function deleteCurrentFolder() {
	if (!currentFolder?.id) {
		console.error('currentFolder is undefined')
		return
	}

	if (
		!window.confirm(
			`Are you sure you want to delete the folder '${currentFolder?.name}' and everything inside?`
		)
	) {
		return
	}

	try {
		const success = await deleteFolder(currentFolder.id)

		if (success) return await navigateTo('/folders')
	} catch (err) {
		console.error(err)
	}

	// If something goes wrong, show the files and folders that did not get deleted
	refreshFiles()
	refreshFolders()
}

// Recursively delete all folders and files in a folder and returns true if succesful
async function deleteFolder(id: string): Promise<boolean> {
	const directus = useDirectus()

	try {
		const childFolders = await query<DirectusFolder>('directus_folders', {
			filter: {
				parent: {
					_eq: id,
				},
			},
			limit: -1,
		})

		if (childFolders.length) {
			for (const folder of childFolders) {
				const success = await deleteFolder(folder.id)

				if (!success) return false
			}
		}
	} catch (err) {
		alert('There was an error deleting the current folder and all contents')
		console.error(err)
		return false
	}

	try {
		const filesInFolder = await query<DirectusFile>('directus_files', {
			filter: {
				folder: {
					_eq: id,
				},
			},
			limit: -1,
		})

		if (filesInFolder.length) {
			await directus.files.deleteMany(filesInFolder.map(file => file.id))
		}
	} catch (err) {
		alert('There was an error deleting files in folder with id: ' + id)
		console.error(err)
		return false
	}

	try {
		await directus.folders.deleteOne(id)
	} catch (err) {
		alert('There was an error deleting current folder')
		console.error(err)
		return false
	}

	return true
}

//* MOVE FOLDER
const moveFolderModal = ref<HTMLInputElement>()

async function moveCurrentFolder(targetFolder: TreeFolder) {
	if (!currentFolder?.id) {
		console.error('currentFolder is undefined')
		return
	}

	if (targetFolder === currentFolder) {
		alert('You cannot move a folder into itself')
		return
	}

	const directus = useDirectus()

	try {
		await directus.folders.updateOne(currentFolder?.id, {
			parent: targetFolder.id,
		})
	} catch (err) {
		alert(
			`There was an error moving the folder '${currentFolder.name}' into '${targetFolder.name}'`
		)
		console.error(err)
	}

	moveFolderModal.value?.click() // close modal

	refreshFolders()
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

//* FILE SELECTION
const { selected: selectedFiles, select: selectFile } = useSelection<DirectusFile>()

//* RENAME FILE
async function renameSelectedFile() {
	if (selectedFiles.value.length !== 1) return

	const file = selectedFiles.value[0]

	const name: string | null = prompt('Rename file', file.filename_download)

	if (!name) return

	try {
		const directus = useDirectus()

		await directus.files.updateOne(file.id, {
			filename_download: name,
		})
	} catch (err) {
		alert(`There was an error renaming the file '${file.filename_download}'`)
		console.error(err)
	}

	refreshFiles()
}

//* DELETE FILES
async function deleteSelectedFiles() {
	if (!selectedFiles.value.length) return

	const msg =
		selectedFiles.value.length > 1
			? `Are you sure you want to delete multiple files?`
			: `Are you sure you want to delete the file '${selectedFiles.value[0].filename_download}'?`
	if (!window.confirm(msg)) {
		return
	}

	try {
		const directus = useDirectus()

		await directus.files.deleteMany(selectedFiles.value.map(file => file.id))
	} catch (err) {
		alert(`There was an error deleting files`)
		console.error(err)
	}

	refreshFiles()
}

//* DOWNLOAD FILE
const fileDownloadUrl = $computed<string>(() => {
	if (selectedFiles.value.length !== 1) return ''

	const file = selectedFiles.value[0]

	return getAssetUrl(file.id, { download: true })
})

//* MOVE FILES
const moveFilesModal = ref<HTMLInputElement>()

async function moveSelectedFiles(targetFolder: TreeFolder) {
	if (!selectedFiles.value.length) return

	const directus = useDirectus()

	try {
		await directus.files.updateMany(
			selectedFiles.value.map(file => file.id),
			{
				folder: targetFolder.id,
			}
		)
	} catch (err) {
		alert(`There was an error moving the selected files into '${targetFolder.name}'`)
		console.error(err)
	}

	moveFilesModal.value?.click() // close modal

	refreshFiles()
}
</script>

<style lang="postcss" scoped>
.file-grid {
	@apply grid gap-6;

	--file-width: 80px;
	@screen sm {
		/* 112px is the height of the mimetype icons and coincidentally fits pretty well */
		--file-width: 112px;
	}

	grid-template-columns: repeat(auto-fill, minmax(var(--file-width), 1fr));
}
</style>
