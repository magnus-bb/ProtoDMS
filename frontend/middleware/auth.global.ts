export default defineNuxtRouteMiddleware(async (to, from) => {
	const ALLOWED_ROUTES = ['/signin', '/signup']
	if (ALLOWED_ROUTES.includes(to.path)) {
		return // let the user through
	}
	try {
		const directus = useDirectus()
		// If refresh works, it means user is authed - it also makes sure the access token is not stale
		await directus.auth.refresh()
	} catch (err) {
		console.warn('User is not authed, redirecting to log in page')
		console.warn(err)
		return navigateTo('/signin?redirectTo=' + to.fullPath)
	}
})
