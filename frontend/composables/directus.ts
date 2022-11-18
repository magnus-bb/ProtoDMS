import { Directus } from '@directus/sdk'
import type { DirectusUsers as User } from '@/types/directus'

import type { SignInFormDataValidated, SignUpFormDataValidated } from '@/types/auth'
export function useDirectus() {
	const url = useRuntimeConfig().public.directusUrl

	return useState('directus', () => new Directus(url)).value
}

export function login(formData: SignInFormDataValidated) {
	const directus = useDirectus()

	return directus.auth.login(formData as SignInFormDataValidated)
}

export function refreshLogin() {
	const directus = useDirectus()

	return directus.auth.refresh()
}

export function register(formData: SignUpFormDataValidated): Promise<User> {
	const directus = useDirectus()

	return directus.users.createOne(formData as SignInFormDataValidated) as Promise<User>
}

export function me(): Promise<User> {
	const directus = useDirectus()

	return directus.users.me.read() as Promise<User>
}

export async function readByQuery<T>(
	collection: string,
	query: Record<string, any> = {}
): Promise<T> {
	const directus = useDirectus()

	const response = await directus.items(collection).readByQuery(query)
	return response.data as T
}

// Returns file url
export function getImage(id: string): string {
	const directus = useDirectus()

	return `${directus.url}assets/${id}`
}
// // Returns file url with transformations
// export function getThumbnail(id: string): string {
// 	const url = getImage(id)

// 	const thumbnailUrl = new URL(url)
// 	thumbnailUrl.searchParams.append('height', '30')
// 	thumbnailUrl.searchParams.append('width', '30')
// 	thumbnailUrl.searchParams.append('fit', 'cover')
// 	thumbnailUrl.searchParams.append('quality', '70')

// 	console.log(thumbnailUrl.toString())

// 	return thumbnailUrl.toString()
// }
