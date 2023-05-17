<template>
	<pre>{{ user }}</pre>
</template>

<script setup lang="ts">
// import type { DirectusUsers as DirectusUser } from '@/types/directus'
definePageMeta({
	layout: 'sidebar',
})

const {
	params: { id: userId },
} = useRoute()

const user = await getUserData(userId as string)
</script>
