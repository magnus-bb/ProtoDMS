import { Directus } from '@directus/sdk'

import type { Ref } from 'vue'
import type {
	CustomDirectusTypes,
	DirectusUsers as DirectusUser,
	DirectusRevisions as Revision,
	DirectusFiles as DirectusFile,
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

export function getUserData(id: string): Promise<DirectusUser> {
	const directus = useDirectus()

	return directus.users.readOne(id, {
		fields: ['*', 'related_documents.document_id.*', 'subscriptions.documents_id.*'],
	}) as unknown as Promise<DirectusUser>
}

export async function getDocumentRevisions(documentId: number): Promise<Revision[]> {
	const directus = useDirectus()
	const { accessToken } = useUser()

	const url = new URL(`${trimTrailingSlash(directus.url)}/changelog/${documentId}`)

	url.searchParams.append('access_token', accessToken.value as string)

	// @ts-ignore
	const { data } = await directus.transport.axios.get(url.href)

	return data as Revision[]
}

export async function getUserAggregatedDocumentActivity(
	userId: string
): Promise<{ date: string; count: number }[]> {
	const directus = useDirectus()
	const { accessToken } = useUser()

	const url = new URL(`${trimTrailingSlash(directus.url)}/contributions/${userId}`)

	url.searchParams.append('access_token', accessToken.value as string)

	// @ts-ignore
	const { data } = await directus.transport.axios.get(url.href)

	return data
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

export function updateUser(id: string, changes: Partial<DirectusUser>) {
	const directus = useDirectus()

	return directus.items('directus_users').updateOne(id, changes)
}

export async function updateUserAvatar(userId: string, file: File) {
	// Create a form with the file
	const form = new FormData()
	form.append('file', file)

	const directus = useDirectus()

	// Upload the file and save the file's Directus ID
	const { id: fileId } = (await directus.files.createOne(form)) as unknown as DirectusFile

	// Update the user to use the file ID for the avatar
	return updateUser(userId, { avatar: fileId })
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

//* IMAGES
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

	const url = new URL(`${trimTrailingSlash(directusUrl)}/assets/${assetId}`)

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

export function getFileData(id: string) {
	const directus = useDirectus()

	return directus.files.readOne(id) as unknown as Promise<DirectusFile>
}

//* SHARING
// Takes ID of document to create share for, returns the uuid of the share
export async function createDocumentShare(id: number): Promise<string | undefined> {
	const directus = useDirectus()

	const inOneWeek = addWeeks(new Date(), 1)

	const share = await directus.items('directus_shares').createOne({
		name: 'Document readonly share',
		collection: 'documents',
		item: id.toString(),
		date_end: inOneWeek.toISOString(),
	})

	return share?.id
}
function addWeeks(date: Date, weeks: number): Date {
	date.setDate(date.getDate() + 7 * weeks)

	return date
}

export async function getReadonlyDocument(shareId: string): Promise<Document | Error> {
	const directus = useDirectus()
	const directusUrl = directus.url

	try {
		// @ts-ignore
		const { data } = await directus.transport.axios.get(
			`${trimTrailingSlash(directusUrl)}/readonly/${shareId}`
		)

		return data
	} catch (err) {
		return new Error('There was an error getting the shared document')
	}
}
