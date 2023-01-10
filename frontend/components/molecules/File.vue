<template>
	<button class="flex flex-col items-center drop-shadow-lg">
		<img class="rounded-daisy-btn w-[112px] h-[112px]" :src="fileThumbSrc" />
		<code class="mt-2 text-center break-all">
			{{ file.filename_download }}
		</code>
	</button>
</template>

<script setup lang="ts">
import type { DirectusFiles as File } from '@/types/directus'

const MIMETYPE_ICON_PATH = '/icons/'

// 112px is the height of the mimetype icons and coincidentally fits pretty well
const { file, sideLength = 112 } = defineProps<{
	file: File
	sideLength?: number // in pixels - used to generate thumbnail images
}>()

const fileIsImage = $computed<boolean>(() => file.type?.includes('image') || false)

// If file is an image, get the thumbnail image to show. If it is not, get an icon matching the file ext.
const fileThumbSrc = $computed<string>(() => {
	if (fileIsImage) {
		const { getThumbnail } = useDirectusFiles()

		return getThumbnail(file.id, { width: sideLength, height: sideLength, fit: 'cover' })
	}

	// We want an svg icon file that matches the extension of the filename of the file we display
	const iconFileName = getMimetypeIcon(file.filename_download)

	return MIMETYPE_ICON_PATH + iconFileName
})
</script>
