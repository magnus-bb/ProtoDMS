import type { Ref } from 'vue'

export default function useSelection<T>() {
	const selected = ref<T[]>([]) as Ref<T[]>

	const ctrlPressed = useKeyModifier('Control', { initial: false })

	function select(elem: T) {
		// On ctrl + click (select multiple elements)
		if (ctrlPressed.value) {
			if (selected.value.includes(elem)) {
				// If the elem is already selected, deselect it
				selected.value = selected.value.filter(f => f !== elem)
				return
			}

			// If the elem is not selected, select it
			selected.value.push(elem)
			return
		}

		// On regular click (only select 1 elem)
		if (selected.value.length === 1 && selected.value[0] === elem) {
			// If one elem is selected, and it's the one clicked, deselect it
			selected.value = []
			return
		}

		// If one elem is selected, and it's not the one clicked, change selection to the clicked elem
		selected.value = [elem]
	}

	return {
		selected,
		select,
	}
}
