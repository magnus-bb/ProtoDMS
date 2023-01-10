<template>
	<div class="text-sm breadcrumbs">
		<ul>
			<li v-for="(folder, index) of folderBranch" :key="folder.id">
				<!-- last folder of branch is the current folder -->
				<span v-if="index === folderBranch.length - 1" class="gap-2 text-base flex items-center">
					<Icon style="--fill: 1">folder</Icon><code>{{ folder.name }}</code>
				</span>
				<!-- all other folders are links -->
				<NuxtLink v-else :to="`/folders/${folder.id}`" class="gap-2 text-base">
					<Icon class="folder-icon">folder</Icon><code>{{ folder.name }}</code>
				</NuxtLink>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { DirectusFolders as Folder } from '@/types/directus'

const { allFolders, currentFolder } = defineProps<{
	allFolders: Folder[] // flattened array of all possible directories from directus
	currentFolder: Folder
}>()

const folderBranch = $computed<Folder[]>(() => {
	const branch: Folder[] = []

	branch.push(currentFolder)

	let parentId = currentFolder.parent

	while (parentId) {
		const parentFolder = allFolders.find(folder => folder.id === parentId)

		if (parentFolder) {
			branch.push(parentFolder)
			parentId = parentFolder.parent
		} else {
			break
		}
	}

	return branch.reverse()
})
</script>
