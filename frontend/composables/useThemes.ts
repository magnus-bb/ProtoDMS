import { useStorage } from '@vueuse/core'
import type { RemovableRef } from '@vueuse/core'

const LIGHT_THEME = 'light'
const DARK_THEME = 'dark'
const DEFAULT_THEME = LIGHT_THEME
const THEME_KEY = 'theme'

export type ColorTheme = typeof LIGHT_THEME | typeof DARK_THEME

const theme = useStorage(THEME_KEY, DEFAULT_THEME) as RemovableRef<ColorTheme>

export default function useThemes() {
	const darkMode = computed({
		get() {
			return theme.value === DARK_THEME
		},

		set(val: boolean) {
			if (val) {
				theme.value = DARK_THEME
			} else {
				theme.value = LIGHT_THEME
			}
		},
	})

	return { theme, darkMode }
}
