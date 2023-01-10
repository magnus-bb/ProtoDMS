<template>
	<div>
		<div class="form-control w-full">
			<label v-if="label" class="label w-fit" :class="{ 'font-semibold': boldLabel }" :for="name">
				{{ label }}
			</label>
			<FileSelector
				v-model="files"
				:accept="imageMode ? 'image/*' : ''"
				:name="name"
				v-bind="$attrs"
			>
				<slot />
			</FileSelector>
			<slot name="tooltip" />
		</div>
		<FilePreview
			v-show="files.length"
			class="mt-3"
			:files="files"
			:image-mode="imageMode || false"
			:image-size="imageSize || 200"
			@remove="onFileRemove"
		/>
	</div>
</template>

<script setup lang="ts">
import { useVModel } from '@vueuse/core'

const props = defineProps<{
	name: string
	modelValue: File[]
	// Whether to display image previews or just regular file previews
	imageMode?: boolean
	imageSize?: number | string
	label?: string
	boldLabel?: boolean
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', files: File[]): void
}>()

const files = useVModel(props, 'modelValue', emit)

function onFileRemove(index: number) {
	// to avoid that splice changes the original v-model, we create a new variable
	const filesCopy = [...files.value]
	filesCopy.splice(index, 1)
	files.value = filesCopy
}
</script>

<script lang="ts">
export default {
	inheritAttrs: false,
}
</script>
