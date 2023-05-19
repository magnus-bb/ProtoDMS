const ALLOWED_ROUTES = ['/signin', '/signup', '/readonly']

export default defineNuxtRouteMiddleware(async to => {
	if (ALLOWED_ROUTES.some(route => to.path.startsWith(route))) {
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
