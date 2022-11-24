import type { Ref } from 'vue'

// Contains a reference to the DOM checkbox that toggles the sidebar
const toggleElement = useState('sidebarToggle') as Ref<HTMLInputElement>

export const setToggleElement = (element: HTMLInputElement) => {
	toggleElement.value = element
}

export const sidebarShown = (): boolean => toggleElement.value?.checked

export const showSidebar = () => {
	toggleElement.value.checked = true
}

export const hideSidebar = () => {
	toggleElement.value.checked = false
}
