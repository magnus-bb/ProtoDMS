<template>
	<div ref="swipeContainer" class="relative w-80">
		<!-- transition is a hack to make sure element returns to offsetRight = 0px AFTER transitioning with after-leave -->
		<Transition @leave="hide" @after-leave="afterHide">
			<!-- transition-all class only when not swiping, so it will only transition when you let go -->
			<div
				v-show="shown"
				id="sidebarContent"
				ref="sidebar"
				class="sidebar w-full p-4 overflow-y-auto flex flex-col gap-y-4 absolute h-screen"
				:class="{ 'transition-all': !isSwiping }"
			/>
		</Transition>
	</div>
</template>

<script setup>
// TODO: add prop for left / right mode that inverts everything
import { useSwipe } from '@vueuse/core'

// How far you have to swipe to close the sidebar
const SWIPE_CUTOFF_FRACTION = 0.5 // halfway

const sidebar = ref() // DOM element - actual swipable element
const swipeContainer = ref() // DOM element - only to anchor the swipable sidebar

// Used to trigger transition so sidebar can slide out, but then reset to true be ready next time sidebar opens
// will just initiate <transition> that pushes sidebar out of view and then resets in in view, when the whole drawer is closed again
const shown = ref(true)

const offsetRight = ref('0px') // This is manipulated to make the sidebar swipable
const swipeContainerWidth = computed(() => swipeContainer.value?.offsetWidth) // used to figure out how far to swipe to close

const { isSwiping, lengthX } = useSwipe(sidebar, {
	onSwipe() {
		if (!swipeContainerWidth.value) return

		// If swiping to the left
		if (lengthX.value > 0) {
			// Math.abs() is not strictly necessary, but must be used if we were to swipe to the right instead of left
			const length = Math.abs(lengthX.value)
			offsetRight.value = length + 'px' // push sidebar (from the right) to the left
		} else {
			// If swiping to the right, don't offset the sidebar
			offsetRight.value = '0px'
		}
	},

	onSwipeEnd() {
		// If you let go of swipe more than halfway through, close the sidebar
		if (
			lengthX.value > 0 &&
			swipeContainerWidth.value &&
			Math.abs(lengthX.value) / swipeContainerWidth.value >= SWIPE_CUTOFF_FRACTION
		) {
			// This will trigger <transition> to slide to offsetRight = 100%
			// and then AFTERWARDS reset offset to 0px and set shown to true again
			// since the whole drawer will be closed at this point
			shown.value = false

			// This closes the actual drawer with the sidebar inside
			hideSidebar()
		} else {
			// If you let go too early, just transition sidebar back in place
			offsetRight.value = '0px'
		}
	},
})

// These functions are used by <transition> to slide the sidebar out of view
// and to reset the sidebar position (when drawer is closed) to be ready for next time
function hide() {
	offsetRight.value = '100%'
}
function afterHide() {
	offsetRight.value = '0px'
	shown.value = true
}
</script>

<style lang="postcss" scoped>
.sidebar {
	/* Only set to a positive number when swiping to the left, otherwise it is 0px */
	right: v-bind(offsetRight);
}
</style>
