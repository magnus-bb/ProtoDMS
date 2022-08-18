<template>
	<span class="material-symbols-rounded">
		<slot />
	</span>
</template>

<script setup lang="ts"></script>

<style lang="postcss" scoped>
.material-symbols-rounded {
	font-family: 'Material Symbols Rounded'; /* stylelint-disable-line */
	line-height: 1;
	user-select: none;
	font-variation-settings: 'FILL' var(--fill, 0), 'wght' var(--weight, 400),
		'GRAD' var(--grade, 0), 'opsz' var(--optical-size, 24);
}

/*
classes are quicker to initialize than js props 
that are bound to the css with v-bind (so we get no flicker),
and we also get to keep a tailwind-like syntax
*/
.fill {
	--fill: 1;
}

/* stylelint-disable rule-empty-line-before */
.weight {
	&-100 {
		--weight: 100;
	}
	&-200 {
		--weight: 200;
	}
	&-300 {
		--weight: 300;
	}
	&-400 {
		--weight: 400;
	}
	&-500 {
		--weight: 500;
	}
	&-600 {
		--weight: 600;
	}
	&-700 {
		--weight: 700;
	}
}

/* stylelint-disable selector-class-pattern */
.-grade {
	&-50 {
		--grade: -50;
	}
	&-25 {
		--grade: -25;
	}
}

.grade {
	&-0 {
		--grade: 0;
	}
	&-100 {
		--grade: 100;
	}
	&-200 {
		--grade: 200;
	}
}

.optical-size {
	&-20 {
		--optical-size: 20;
	}
	&-24 {
		--optical-size: 24;
	}
	&-40 {
		--optical-size: 40;
	}
	&-48 {
		--optical-size: 48;
	}
}

/* add outline / sharp here as well if needed */
</style>
