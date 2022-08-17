<template>
	<div
		v-if="!colorMode.unknown"
		class="relative flex items-center justify-center cursor-pointer"
		@click="toggleTheme"
	>
		<Icon
			class="sun text-4xl text-neutral-content"
			:class="{
				'rotate-[360deg] text-neutral': $colorMode.value === LIGHT_THEME,
			}"
			optical-size="48"
			fill
		>
			&#xe1ac;
		</Icon>
		<Icon
			class="circle text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neutral-content duration-500 ease-out"
			:class="{
				'scale-150 -translate-x-full text-neutral':
					$colorMode.value === LIGHT_THEME,
			}"
			optical-size="20"
			fill
		>
			circle
		</Icon>
	</div>

	<div v-else class="flex items-center justify-center">
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
