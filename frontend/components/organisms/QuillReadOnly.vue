<template>
	<QuillEditor v-once :options="options" :content="props.content.ops as any" class="!border-0" />
</template>

<script setup lang="ts">
import { QuillEditor, Delta } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

/* MUST use this wrapper comp. to get v-once working correctly with :content so quill
does not keep failing updates when searching which calls a diff check that fails */
const props = defineProps<{
	content: Delta
}>()

const options = {
	modules: {
		toolbar: [],
		mention: useQuillMentions(),
	},
	readOnly: true,
	enable: false,
	theme: 'snow',
	placeholder: 'No content yet...',
}
</script>
