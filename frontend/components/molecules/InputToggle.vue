<template>
	<div>
		<div v-if="inputShown" v-on-click-outside="hideInput" @keydown.enter.esc="hideInput">
			<slot />
		</div>

		<div v-else @click="showInput">
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
