import type { TreeFolder } from '@/types/files'
import type {
	DirectusFolders as DirectusFolder,
	DirectusFiles as DirectusFile,
} from '@/types/directus'

// Go through all folders from directus and use the 'parent' id property to attach
// folders to their parent folders in a 'children' array
export function createDirectoryTree(folders: TreeFolder[]): TreeFolder {
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

export function getAllFolders() {
	return readAll<DirectusFolder>('directus_folders') as Promise<DirectusFolder[]> // This IS a folder array, if undef, something else broke anyway
}
export function getAllFiles() {
	return readAll<DirectusFile>('directus_files') as Promise<DirectusFile[]> // This IS a folder array, if undef, something else broke anyway
}
