import colors from 'tailwindcss/colors'
import daisyThemes from 'daisyui/src/colors/themes'

export default {
	// Neutral and base content are the same, and are both dark versions of primary
	...daisyThemes['[data-theme=dark]'],
	primary: colors.emerald[500],
	secondary: '#6b96bf',
	accent: '#006ECE',
	'accent-content': colors.white, // #fff
	info: colors.indigo[200], // #e0e7ff
	warning: colors.lime[400], // #a3e635
	error: colors.rose[600], // #e11d48,
	'--btn-text-case': 'none',
}
