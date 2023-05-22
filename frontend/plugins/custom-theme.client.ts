import customDaisyTheme from '@/daisyui-theme'

export default defineNuxtPlugin(() => {
	return {
		provide: {
			theme: customDaisyTheme,
		},
	}
})
