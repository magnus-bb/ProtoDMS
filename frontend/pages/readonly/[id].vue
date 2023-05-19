<template>
	<main v-if="!error" class="row pt-8 flex flex-col gap-y-8">
		<h1 class="text-4xl font-semibold text-center">{{ (data as Document).title }}</h1>
		<div data-theme="winter" class="shadow-xl rounded-daisy-box p-8">
			<QuillReadOnly :content="((data as Document).content as any)" />
		</div>
	</main>

	<main v-else class="text-xl text-error">
		{{ data || 'Something went wrong' }}
	</main>
</template>

<script setup lang="ts">
import type { Documents as Document } from '@/types/directus'

definePageMeta({
	layout: false,
})

const { id: shareId } = useRoute().params

const data = await getReadonlyDocument(shareId as string)

const error = $computed<boolean>(() => data instanceof Error)

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

	.ql-blank::before {
		@apply !text-muted !font-bold;
	}
}
</style>
