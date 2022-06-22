<template>
	<div :data-theme="theme" class="min-h-screen">
		<TheNavbar />
		<NuxtPage />
	</div>
</template>

<script lang="ts" setup>
const { theme } = useThemes()
</script>

<style scoped></style>
