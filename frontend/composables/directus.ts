import { Directus } from '@directus/sdk'

import type { Ref } from 'vue'
import type { CustomDirectusTypes, DirectusUsers as DirectusUser } from '@/types/directus'
import type { SignInFormData, SignUpFormData } from '@/types/auth'

export function useDirectus() {
	const url = useRuntimeConfig().public.directusUrl

	const directus = $(useState('directus', () => new Directus(url)))

	return directus
}

export async function query<T>(collection: keyof CustomDirectusTypes, query: any): Promise<T[]> {
	const directus = useDirectus()

	const { data } = (await directus.items(collection).readByQuery(query)) as { data: T[] }

	return data
}

export function readAll<T>(collection: keyof CustomDirectusTypes): Promise<T[]> {
	return query(collection, { limit: -1 })
}

//* AUTH
export function useUser(): { user: Ref<DirectusUser | null>; accessToken: Ref<string | null> } {
	const user = useState<DirectusUser | null>('user', () => null)
	// Use ref for access token, since we always want to refetch from localStorage
	const accessToken = ref<string | null>(localStorage.getItem('auth_token'))

	// Important to not use await to keep reactivity of returned user
	if (!user.value) {
		getUser()
			.then(authedUser => {
				if (authedUser) user.value = authedUser
			})
			.catch(() => console.warn('Could not get logged in user'))
	}

	return {
		user,
		accessToken,
	}
}

export async function getUser(): Promise<DirectusUser> {
	const directus = useDirectus()

	try {
		await directus.auth.refresh()
	} catch (err) {
		console.warn('Could not refresh access token')
	}

	return directus.users.me.read() as Promise<DirectusUser>
}

export async function login(formData: SignInFormData) {
	const directus = useDirectus()

	// These automatically set the auth_token in localstorage and refresh in cookie
	try {
		await directus.auth.refresh()
	} catch (err) {
		await directus.auth.login(formData as SignInFormData)
	}

	const user = useState('user')

	user.value = await getUser()
}
export async function signup(formData: SignUpFormData) {
	const directus = useDirectus()

	const { authenticatedRoleId } = useRuntimeConfig().public

	/* eslint-disable camelcase */
	// It is important that we remove the 'confirm_password' field, as it is not a valid field for the API
	const { first_name, last_name, email, password } = formData as SignUpFormData

	await directus.users.createOne({
		first_name,
		last_name,
		email,
		password,
		role: authenticatedRoleId,
	})
	/* eslint-enable camelcase */

	await login({ email, password })
}

//* FILES
// Based on nuxt-directus
type DirectusImageFormat = 'jpg' | 'png' | 'webp' | 'tiff'
type DirectusImageFit = 'cover' | 'contain' | 'inside' | 'outside'
interface DirectusImageOptions {
	width?: number
	height?: number
	quality?: number
	fit?: DirectusImageFit
	format?: DirectusImageFormat
	withoutEnlargement?: boolean
	key?: string
}

export function getAssetUrl(assetId: string, options?: DirectusImageOptions): string {
	const { directusUrl } = useRuntimeConfig().public
	const { accessToken } = useUser()

	const url = new URL(`${directusUrl}assets/${assetId}`)

	if (accessToken.value) {
		url.searchParams.append('access_token', accessToken.value)
	}

	if (options) {
		if (options.width) {
			url.searchParams.append('width', options.width.toFixed(0))
		}
		if (options.height) {
			url.searchParams.append('height', options.height.toFixed(0))
		}
		if (options.quality) {
			url.searchParams.append('quality', options.quality.toFixed(0))
		}
		if (options.withoutEnlargement) {
			url.searchParams.append('withoutEnlargement', 'true')
		}
		if (options.fit) {
			url.searchParams.append('fit', options.fit)
		}
		if (options.format) {
			url.searchParams.append('format', options.format)
		}
		if (options.key) {
			url.searchParams.append('key', options.key)
		}
	}

	return url.href
}
