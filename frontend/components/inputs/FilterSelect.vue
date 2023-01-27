<template>
	<div
		ref="dropdown"
		class="w-full scrollbar"
		:class="{
			'dropdown dropdown-hover': props.hover,
			'toggleable-dropdown': !props.hover,
			open: menuOpen,
		}"
	>
		<label :id="props.name" class="sr-only" :for="props.name + 'Button'">
			<slot />
		</label>
		<!-- h-auto is important so button can grow if selected values start wrapping -->
		<button
			v-bind="$attrs"
			:id="props.name + 'Button'"
			tabindex="0"
			class="btn btn-block h-fit py-2 pr-7 relative no-animation"
			:class="{ 'btn-sm': props.small }"
			aria-haspopup="listbox"
			:aria-labelledby="props.name"
			@click="onButtonClick"
			@keydown.prevent.up="focusLast"
			@keydown.prevent.down="focusFirst"
		>
			<!-- selectedLabels can be array or string -->
			<template v-if="Array.isArray(selectedLabels) && selectedLabels?.length">
				<div class="w-full h-full flex flex-wrap gap-1.5 items-center overflow-hidden normal-case">
					<span
						v-for="(label, index) of selectedLabels"
						:key="label"
						class="badge badge-primary gap-1.5 truncate !border-0"
						:class="{ 'badge-sm': props.small }"
						role="button"
						@click.stop="removeSelected(index)"
					>
						<Icon class="fill optical-size-24 grade-100" aria-hidden>close</Icon>
						<span class="truncate font-normal">{{ label }}</span>
					</span>
				</div>
			</template>
			<!-- if selectedLabels is either empty array or does not have a value, show the placeholder (field label) -->
			<template
				v-else-if="!selectedLabels || (Array.isArray(selectedLabels) && !selectedLabels?.length)"
			>
				<slot />
			</template>
			<!-- otherwise just show the singular selected value -->
			<template v-else>
				{{ selectedLabels }}
			</template>
			<Icon
				class="fill optical-size-24 grade-100 absolute right-4 self-center text-xl leading-none bg-transparent"
				aria-hidden
				>expand_more</Icon
			>
		</button>
		<ul
			ref="dropdownContent"
			name="options"
			tag="ul"
			:aria-labelledby="props.name"
			role="listbox"
			tabindex="-1"
			class="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-full max-h-80 overflow-y-auto overflow-x-hidden flex-nowrap"
			:class="{ 'menu-compact': props.small }"
		>
			<!-- min-h to force regular height (3rem) of input -->
			<input
				ref="filterInput"
				v-model="filterString"
				placeholder="Search"
				class="input input-bordered w-full shrink-0 placeholder:text-muted mb-2"
				:class="{ 'input-sm': props.small }"
				@keydown.delete="onFilterInputDelete"
				@keydown.prevent.down="focusNext"
			/>
			<li
				v-for="option of filteredOptions"
				:key="getLabelProp(option)"
				tabindex="0"
				role="option"
				@click="onOptionSelect(option)"
				@keydown.enter="onOptionSelect(option)"
				@keydown.prevent.up="focusPrev"
				@keydown.prevent.down="focusNext"
			>
				<span class="truncate whitespace-normal w-full inline-flex justify-between">
					{{ getLabelProp(option) }}
					<span v-if="props.countProp" class="text-muted">
						{{ getCountProp(option) }}
					</span>
				</span>
			</li>
			<li
				v-show="!filteredOptions?.length"
				:aria-hidden="!filteredOptions?.length"
				class="disabled truncate"
			>
				<span class="pointer-events-none">No items match your filter</span>
			</li>
		</ul>
	</div>
</template>

<script setup>
import { breakpointsTailwind } from '@vueuse/core'
import formatTitle from '@directus/format-title'
const breakpoints = useBreakpoints(breakpointsTailwind)

const props = defineProps({
	// Will be a string when using as a single select, primitive options input
	// Will be an object when using as a single select, object options input
	// Will be an array of strings / object when using as a multiselect
	modelValue: {
		type: [String, Object, Array],
		default: null, // keep vue from complaining if bound ref is initialized empty
	},
	name: {
		type: String,
		required: true,
	},
	/*
	Leave empty to use an array of string options
	Set to a string to use a specific property (the string) on an array of object options as the label
	Set to a function to manually return the prop on the option object to use as label, e.g. (option) => option.label
	*/
	labelProp: {
		type: [String, Function],
		default: null,
	},
	/*
	If options are objects, you can bind modelValue to be a specific prop on the object
	instead of being the whole object. Similarly to labelProp, that only displays a specific
	prop from the options objects. Set this to a string to emit the specific prop of that name,
	or a function that manually returns the prop to use for emitting.
	emitProp should always be unique since it is also used to find the selected options.
	*/
	emitProp: {
		type: [String, Function],
		default: null,
	},
	/*
	If the countProp is set, this prop will be used to display a number to the right of every option.
	This can be useful for filters / facets where you want to show how many results have this option selected
	*/
	countProp: {
		type: [String, Function],
		default: null,
	},
	// An array of the options to select from in the dropdown
	options: {
		type: Array,
		default: () => [],
		// required: true,
	},
	// Should you be able to select multiple values?
	multiple: {
		type: Boolean,
		default: false,
	},
	// // Should you be able to add a value that is not in the options? (NOT IMPLEMENTED)
	// allowCustomValue: {
	// 	type: Boolean,
	// 	default: false,
	// },
	small: {
		type: Boolean,
		default: false,
	},
	hover: {
		type: Boolean,
		default: false,
	},
})

const emit = defineEmits(['update:modelValue'])

//* FILTERING
const filterString = ref('')

const filteredOptions = computed(() => {
	const filterStringLower = filterString.value.toLowerCase()

	return props.options
		?.filter?.(option =>
			// only show options that match the filter string
			getLabelProp(option).toLowerCase().includes(filterStringLower)
		)
		.filter?.(option => {
			if (!props.modelValue) {
				return true
			}
			// also only show options that are not already selected
			if (props.multiple) {
				// if the option also exists in modelValue (selected vals), don't show it (either primitives and objects)
				return !props.modelValue.some(
					selected => getEmitProp(option) === selected || deepEqual(option, selected)
				)
			}

			// if option and selected val are the same (either primitive or object)
			return !(props.modelValue === getEmitProp(option) || deepEqual(option, props.modelValue))
		})
})

// Util used to check if an option object is already selected
function deepEqual(x, y) {
	const ok = Object.keys
	const tx = typeof x
	const ty = typeof y
	return x && y && tx === 'object' && tx === ty
		? ok(x).length === ok(y).length && ok(x).every(key => deepEqual(x[key], y[key]))
		: x === y
}

function resetInput() {
	filterString.value = ''
}

//* LABELS AND SELECTION
function getLabelProp(option) {
	// Simple string values as options, just show the options without transforming
	if (!props.labelProp) {
		return formatTitle(option)
	}

	// Show a specific key on the option object
	if (typeof props.labelProp === 'string') {
		return option[props.labelProp]
	}

	// Show a complex value depending on the option passed in
	if (typeof props.labelProp === 'function') {
		return props.labelProp(option)
	}
}

const selectedLabels = computed(() => {
	if (!props.modelValue) {
		return
	}

	if (props.multiple) {
		return props.modelValue.map(selectedOption => {
			if (!props.emitProp) {
				// If no particular prop is used for emitting (or the options are just strings),
				// Just return the label for the selected option normally
				return getLabelProp(selectedOption)
			}

			// However, if a particular prop is used for binding modelValue, we have to find the option object
			// with that corresponding emitProp (unique value), so we can find the label prop on that object
			const selectedObject = props.options?.find(option => getEmitProp(option) === selectedOption)

			if (!selectedObject) return undefined

			return getLabelProp(selectedObject)
		})
	}

	// Again, if the options are just strings or bound (emitted as modelValue) as their full objects,
	// just return the label for the selected option normally
	if (!props.emitProp) {
		return props.modelValue ? [getLabelProp(props.modelValue)] : []
	}

	// Otherwise, find the option object with that corresponding emitProp (unique value), so we can find the label prop on that object
	const selectedObject = props.options?.find(option => getEmitProp(option) === props.modelValue)
	return labelProp(selectedObject)
})

function onFilterInputDelete() {
	// only remove selected value if filter input is empty
	if (filterString.value) return

	removeLastSelected()
}

function removeLastSelected() {
	if (props.multiple && Array.isArray(props.modelValue) && props.modelValue.length) {
		emit('update:modelValue', props.modelValue.slice(0, -1))
		return
	}

	if (props.modelValue && !Array.isArray(props.modelValue)) {
		emit('update:modelValue', null)
	}
}

function removeSelected(index) {
	if (props.multiple) {
		emit(
			'update:modelValue',
			props.modelValue.filter((_, i) => i !== index)
		)
		return
	}

	emit('update:modelValue', null)
}

function getEmitProp(selected) {
	if (!props.emitProp) {
		/*
		When emitProp is not used, it is either because the options are just strings,
		that should be emitted as-is, or because the whole option object should be emitted.
		*/
		return selected
	}

	// If the emitProp is a string, find the value of that string key on the selected option object
	if (typeof props.emitProp === 'string') {
		return selected[props.emitProp]
	}

	// If the emitProp is a function, use that function to return which prop
	// on the selected option to emit
	if (typeof props.emitProp === 'function') {
		return props.emitProp(selected)
	}
}

//* LABELS AND SELECTION
function getCountProp(option) {
	// If no count prop is set, return no value for count
	if (!props.countProp) {
		return null
	}

	// Show a specific key on the option object as the count (e,g. option.count)
	if (typeof props.countProp === 'string') {
		return option[props.countProp]
	}

	// Show a complex value depending on the option passed in
	if (typeof props.countProp === 'function') {
		return props.countProp(option)
	}
}

//* DROPDOWN
const filterInput = ref(null) // DOM element
const dropdownContent = ref(null) // DOM element

function onOptionSelect(option) {
	resetInput()

	// Emit array of already selected options + the newly selected option if you can have more than one selected,
	// otherwise just emit the newly selected option
	if (props.multiple) {
		emit('update:modelValue', [...props.modelValue, getEmitProp(option)])
	} else {
		emit('update:modelValue', getEmitProp(option))
	}

	// Only focus the filter input if there are more things to select
	if (props.multiple) {
		focusFilterInput()
	}
}

function focusFilterInput() {
	// Only focus the filter input if desktop
	if (!filterInput.value || !breakpoints.sm.value) return

	filterInput.value.focus()
}

// Always called from dropdown button
function focusFirst() {
	dropdownContent.value?.firstElementChild?.focus?.()
}
function focusLast() {
	// lastElementChild is the disabled 'No items match your filter'-option, so we need the second to last
	const children = dropdownContent.value?.children
	children?.[children?.length - 2].focus()
}
// Always called with event.target as an option in the dropdown menu
function focusPrev(event) {
	event.target.previousElementSibling?.focus?.()
}
function focusNext(event) {
	event.target.nextElementSibling?.focus?.()
}

//* TOGGLE OPEN STATE
// This is only used for non-hover version
const dropdown = ref() // DOM element
const menuOpen = ref(false)
function onButtonClick() {
	// Don't use toggle when in hover mode
	if (props.hover) {
		focusFilterInput()
		return
	}

	if (menuOpen.value) {
		menuOpen.value = false
		return
	}

	menuOpen.value = true
	focusFilterInput()
}
onClickOutside(dropdown, () => {
	if (menuOpen.value) menuOpen.value = false
})
</script>

<script>
export default {
	inheritAttrs: false,
}
</script>

<style scoped></style>
