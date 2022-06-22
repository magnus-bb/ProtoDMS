import { useStorage } from '@vueuse/core'

const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const DEFAULT_THEME = LIGHT_THEME

const theme = useStorage('theme', DEFAULT_THEME)

export default function useThemes() {
	const darkMode = computed({
		get() {
			return theme.value === DARK_THEME
		},

		set(val) {
			if (val) {
				theme.value = DARK_THEME
			} else {
				theme.value = LIGHT_THEME
			}
		},
	})

	return { theme, darkMode }
}
