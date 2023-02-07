<template>
	<div class="modal modal-bottom md:modal-middle">
		<div
			v-on-click-outside="hide"
			class="modal-box !max-w-2xl overflow-y-visible"
			:class="boxClasses"
		>
			<button class="btn btn-sm btn-circle absolute right-2 top-2" @click="hide">
				<Icon class="text-xl optical-size-24 grade-100">close</Icon>
			</button>

			<h3 v-if="$slots.heading" class="text-lg font-bold mb-4"><slot name="heading" /></h3>

			<slot />

			<div v-if="$slots.actions" class="modal-action">
				<slot name="actions" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

const { boxClasses } = defineProps<{
	boxClasses?: string
}>()

// Toggle the class .modal-open on the root element to use the default daisy way of showing/hiding modal
const emit = defineEmits<{
	(e: 'hide'): void
}>()

function hide() {
	emit('hide')
}
</script>
