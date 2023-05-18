<template>
	<main class="row pt-48 flex flex-col justify-center gap-y-4">
		<h2 class="text-center text-2xl text-semibold">Click file to begin download</h2>
		<NuxtLink
			class="mx-auto w-auto"
			title="download"
			:to="getAssetUrl(file.id, { download: true })"
		>
			<File :file="file" />
		</NuxtLink>
	</main>
</template>

<script setup lang="ts">
const { params } = useRoute()
const file = await getFileData(params.id as string)
</script>

<style lang="postcss" scoped></style>
