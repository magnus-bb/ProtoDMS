<template>
	<button
		v-if="!colorMode.unknown"
		class="relative btn btn-square btn-ghost"
		@click="toggleTheme"
	>
		<Icon
			class="sun optical-size-48 fill text-4xl text-neutral-content"
			:class="{
				'rotate-[360deg] text-neutral': $colorMode.value === LIGHT_THEME,
			}"
		>
			&#xe1ac;
		</Icon>
		<Icon
			class="optical-size-20 fill text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-content duration-500 ease-out"
			:class="{
				'scale-150 -translate-x-full text-neutral':
					$colorMode.value === LIGHT_THEME,
			}"
		>
			circle
		</Icon>
	</button>

	<div v-else class="btn btn-square btn-ghost disabled">
		<Icon
			class="text-4xl motion-safe:animate-spin-slow text-base-300"
			style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 48"
		>
			&#xe1ac;
		</Icon>
	</div>
</template>

<script setup lang="ts">
const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'

const colorMode = useColorMode()

function toggleTheme() {
	if (colorMode.value === LIGHT_THEME) {
		colorMode.preference = DARK_THEME
	} else {
		colorMode.preference = LIGHT_THEME
	}
}
</script>

<style lang="postcss" scoped>
/* Have to set differing durations manually is css */
.sun {
	/* slow ease-in-bounce on rotate, faster linear o color */
	transition: transform 700ms cubic-bezier(0.68, 0.11, 0.5, 1.29),
		color 500ms ease-out;
}
</style>
