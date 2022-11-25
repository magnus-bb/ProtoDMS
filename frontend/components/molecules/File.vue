<template>
	<div>
		<div class="aspect-square bg-base-200 rounded-daisy-btn shadow-md"></div>
		<h3>{{ file.filename_download }}</h3>
	</div>
</template>

<script setup lang="ts">
// TODO: show icons / previews for different file types. If mimetype contains 'image', get the thumbnail. If not, get an icon matching the mimetype
import type { DirectusFiles as File } from '@/types/directus'

const { file } = defineProps<{
	file: File
}>()
</script>

<style lang="postcss" scoped></style>
