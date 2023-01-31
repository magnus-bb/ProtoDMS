import { Directus } from '@directus/sdk'

import type { Ref } from 'vue'
import type {
	CustomDirectusTypes,
	DirectusUsers as DirectusUser,
	Documents as Document,
} from '@/types/directus'
import type { SignInFormData, SignUpFormData } from '@/types/auth'

export function useDirectus() {
	const url = useRuntimeConfig().public.directusUrl

	const directus = $(useState('directus', () => new Directus<CustomDirectusTypes>(url)))

	return directus
}

//* READ
export async function query<T>(collection: keyof CustomDirectusTypes, query: any): Promise<T[]> {
	const directus = useDirectus()

	const { data } = (await directus.items(collection).readByQuery(query)) as { data: T[] }

	return data
}

export function readAll<T>(collection: keyof CustomDirectusTypes): Promise<T[]> {
	return query(collection, { limit: -1 })
}

export function readAllUsers(): Promise<DirectusUser[]> {
	const { authenticatedRoleId } = useRuntimeConfig().public

	return query<DirectusUser>('directus_users', {
		filter: {
			role: authenticatedRoleId,
		},
		limit: -1,
	})
}

//* DELETE
export function deleteMany(collection: keyof CustomDirectusTypes, ids: number[]) {
	const directus = useDirectus()

	return directus.items(collection).deleteMany(ids)
}

export function deleteTag(id: number) {
	const directus = useDirectus()

	return directus.items('tags').deleteOne(id)
}

//* CREATE
export function createDocument(doc: Partial<Document>) {
	const directus = useDirectus()

	return directus.items('documents').createOne(doc)
}

export function createTag(name: string) {
	const directus = useDirectus()

	return directus.items('tags').createOne({
		name,
	})
}

//* UPDATE
export function updateDocument(id: number, doc: Partial<Document>) {
	const directus = useDirectus()

	return directus.items('documents').updateOne(id, doc)
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
			.catch(() => console.error('Could not get logged in user'))
	}

	return {
		user,
		accessToken,
	}
}

export async function getUser(): Promise<DirectusUser> {
	const directus = useDirectus()

	await directus.auth.refresh()

	return directus.users.me.read() as Promise<DirectusUser>
}

export async function login(formData: SignInFormData) {
	const directus = useDirectus()

	// These automatically set the auth_token in localstorage and refresh in cookie
	await directus.auth.login(formData as SignInFormData)

	const user = useState<DirectusUser | null>('user')

	user.value = await getUser()
}

export async function logout() {
	const directus = useDirectus()

	try {
		await directus.auth.logout()
		const user = useState<DirectusUser | null>('user')

		user.value = null
	} catch (err) {
		console.warn('Could not log out')
		alert('Could not log out')
	}
}

export async function signup(formData: SignUpFormData) {
	const directus = useDirectus()

	const { authenticatedRoleId } = useRuntimeConfig().public

	// It is important that we remove the 'confirm_password' field, as it is not a valid field for the API
	const { first_name, last_name, email, password } = formData as SignUpFormData

	await directus.users.createOne({
		first_name,
		last_name,
		email,
		password,
		role: authenticatedRoleId,
	})

	await login({ email, password })
}

//* FILES
// Based on nuxt-directus
type DirectusImageFormat = 'jpg' | 'png' | 'webp' | 'tiff'
type DirectusImageFit = 'cover' | 'contain' | 'inside' | 'outside'
export interface DirectusImageOptions {
	width?: number
	height?: number
	quality?: number
	fit?: DirectusImageFit
	format?: DirectusImageFormat
	withoutEnlargement?: boolean
	key?: string
	download?: boolean
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
		if (options.download) {
			url.searchParams.append('download', 'true')
		}
	}

	return url.href
}
