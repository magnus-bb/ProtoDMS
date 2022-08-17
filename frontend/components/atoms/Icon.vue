<template>
	<span class="material-symbols-rounded">
		<slot />
	</span>
</template>

<script setup lang="ts">
// eslint-disable-next-line vue/no-setup-props-destructure
const {
	// type = 'rounded', // for now we only use rounded
	fill = false,
	opticalSize = 24,
	weight = 400,
	grade = 0,
} = defineProps<{
	// type?: 'rounded' | 'sharp' | 'outline' // for now we only use rounded
	fill?: boolean
	opticalSize?: 20 | '20' | 24 | '24' | 40 | '40' | 48 | '48'
	weight?: // Lol
	| 100
		| '100'
		| 200
		| '200'
		| 300
		| '300'
		| 400
		| '400'
		| 500
		| '500'
		| 600
		| '600'
		| 700
		| '700'
		| 800
		| '800'
		| 900
		| '900'
	grade?: -50 | '-50' | -25 | '-25' | 0 | '0' | 100 | '100' | 200 | '200'
}>()

const fillInt = computed<0 | 1>(() => (fill ? 1 : 0)) // convert to int
</script>

<style lang="postcss" scoped>
.material-symbols-rounded {
	font-family: 'Material Symbols Rounded';
	line-height: 1;
	user-select: none;

	font-variation-settings: 'FILL' v-bind(fillInt), 'wght' v-bind(weight),
		'GRAD' v-bind(grade), 'opsz' v-bind(opticalSize);
}

/* add outline / sharp here as well if needed */
</style>
