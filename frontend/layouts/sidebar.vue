<template>
	<TheHeader />
	<div class="drawer drawer-mobile">
		<input id="sidebar" ref="sidebarToggle" type="checkbox" class="drawer-toggle" />
		<div
			v-bind="$attrs"
			id="drawer-content"
			class="drawer-content flex flex-col min-h-screen overflow-x-hidden"
		>
			<slot />
		</div>

		<div class="drawer-side">
			<label for="sidebar" class="drawer-overlay"></label>
			<Sidebar />
		</div>
	</div>
</template>

<script setup lang="ts">
const sidebarToggle = ref<HTMLInputElement>()

onMounted(() => {
	setToggleElement(sidebarToggle.value as HTMLInputElement)
})
</script>

<script lang="ts">
export default {
	inheritAttrs: false,
}
</script>
