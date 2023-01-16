<template>
	<div class="flex items-center">
		<div
			v-if="inputShown"
			v-on-click-outside="hideInput"
			class="w-full flex items-center"
			@keydown.enter.esc="hideInput"
		>
			<slot />
		</div>

		<div v-else class="w-full flex items-center" @click="showInput">
			<slot name="display" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

const emit = defineEmits<{
	(e: 'hideInput'): void
	(e: 'showInput'): void
}>()

let inputShown = $ref<boolean>(false)

function hideInput() {
	inputShown = false
	emit('hideInput')
}

function showInput() {
	inputShown = true
	emit('showInput')
}
</script>

<style lang="postcss" scoped></style>
