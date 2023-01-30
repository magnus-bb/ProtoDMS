<template>
	<label
		:for="name"
		:class="[
			circle ? 'btn-circle' : '',
			center ? 'mx-auto' : '',
			`btn-${size}`,
			{ 'btn btn-accent': button },
		]"
		tabindex="0"
		@keydown.enter="fileInput?.click()"
	>
		<slot />
		<input
			v-bind="$attrs"
			:id="name"
			ref="fileInput"
			class="hidden"
			:name="name"
			type="file"
			@change="onFileSelect"
		/>
	</label>
</template>

<script lang="ts" setup>
// This component is made to work with something that can manage the array of files. I.e. this will just emit the selected files together with the already selected files array.
// That means that the FileInput can only add files to the modelled array, but something else will have to display the files / remove them from the array.
const {
	name,
	modelValue,
	size = 'md',
	button = false,
	circle,
	center,
} = defineProps<{
	name: string
	// if modelValue is omitted, you will have to handle native input element files manually with @change from parent
	modelValue?: File[]
	button?: boolean
	circle?: boolean
	center?: boolean // must be in flexbox
	size?: 'sm' | 'md' | 'lg'
}>()

const emit = defineEmits<{
	(e: 'update:modelValue', files: File[]): void
}>()

const fileInput = $ref<HTMLInputElement>()

function onFileSelect(event: Event) {
	// if modelValue is omitted, you will have to handle native input element files manually with @change from parent
	if (!modelValue) return

	const files = (event.target as HTMLInputElement).files

	if (!files) return

	emit('update:modelValue', [...modelValue, ...files])

	resetInput()
}

function resetInput() {
	if (fileInput) {
		fileInput.value = ''
	}
}
</script>

<script lang="ts">
export default {
	inheritAttrs: false,
}
</script>
