<template>
	<main v-if="!error && document" class="row pt-8 flex flex-col gap-y-8">
		<h1 class="text-4xl font-semibold text-center">{{ document.title }}</h1>
		<div data-theme="winter" class="shadow-xl rounded-daisy-box p-8">
			<QuillReadOnly :content="document.content" />
		</div>
	</main>

	<main v-else-if="error" class="text-xl text-error">
		{{ error }}
	</main>

	<main v-else class="text-xl text-error">Something went wrong</main>
</template>

<script setup lang="ts">
definePageMeta({
	layout: false,
})

const { id: shareId } = useRoute().params

const { error, data: document } = await getReadonlyDocument(shareId as string)

if (error) {
	console.error(error)
	alert(error)
}
</script>

<style lang="postcss" scoped>
:deep() {
	.ql-toolbar {
		@apply hidden;
	}

	.ql-editor {
		@apply p-0 line-clamp-[10];
	}

	.ql-blank::before {
		@apply !text-muted !font-bold;
	}
}
</style>
