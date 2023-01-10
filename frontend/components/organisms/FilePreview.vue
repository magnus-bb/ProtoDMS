<template>
	<div v-if="imageMode" class="avatar-group -space-x-8 sm:-space-x-16 p-1">
		<!-- must be rounded-full to allow clicking images behind correctly -->
		<div
			v-for="(img, index) of files"
			:key="img.name"
			class="avatar rounded-full !border-0 ring-4 ring-primary hover:ring-error focus-within:ring-error transition bg-base-100"
		>
			<div class="w-44 rounded-full">
				<img
					tabindex="0"
					:src="getUrl(img)"
					alt="Upload image preview"
					class="rounded-full hover:blur-sm focus:blur-sm transition-all outline-0 cursor-pointer"
					@keydown.enter="emit('remove', index)"
					@click="emit('remove', index)"
				/>
			</div>
		</div>
	</div>

	<div v-else class="flex items-center flex-wrap gap-1 overflow-hidden">
		<span
			v-for="(file, index) of files"
			:key="file.name"
			class="badge badge-lg badge-primary gap-2 flex-auto"
			role="button"
			@click="emit('remove', index)"
		>
			<span class="bi bi-x flex place-content-center" aria-hidden />
			<span class="font-mono uppercase">{{ file.name }}</span>
		</span>
	</div>
</template>

<script setup lang="ts">
const { imageMode, files } = defineProps<{
	files: File[]
	// Whether to display image previews or just regular file previews
	imageMode: boolean
}>()

const emit = defineEmits<{
	(e: 'remove', index: number): void
}>()

function getUrl(img: File) {
	return URL.createObjectURL(img)
}
</script>
