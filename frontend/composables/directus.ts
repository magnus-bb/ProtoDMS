// import { Directus } from '@directus/sdk'
// import type { DirectusUsers as User } from '@/types/directus'

// import type { SignInFormDataValidated, SignUpFormDataValidated } from '@/types/auth'

// export function useDirectus() {
// 	const url = useRuntimeConfig().public.directusUrl

// 	const directus = $(useState('directus', () => new Directus(url)))

// 	return directus
// }

// export async function login(formData: SignInFormDataValidated): Promise<User | undefined> {
// 	const directus = useDirectus()

// 	await directus.auth.login(formData as SignInFormDataValidated)

// 	useState<boolean>('loggedIn', () => true)

// 	return getUser()
// }

// export function refreshLogin() {
// 	const loggedIn = $(useState<boolean>('loggedIn'))
// 	if (!loggedIn) return

// 	return useDirectus().auth.refresh()
// }

// export function register(formData: SignUpFormDataValidated): Promise<User> {
// 	const directus = useDirectus()

// 	return directus.users.createOne(formData as SignInFormDataValidated) as Promise<User>
// }

// export async function getUser(): Promise<User | undefined> {
// 	const directus = useDirectus()

// 	const loggedIn = $(useState<boolean>('loggedIn'))
// 	if (!loggedIn) return

// 	let user = $(useState<User>('user'))

// 	user = (await directus.users.me.read()) as User

// 	return user
// }

// export async function readByQuery<T>(
// 	collection: string,
// 	query: Record<string, any> = {}
// ): Promise<T> {
// 	const directus = useDirectus()

// 	const response = await directus.items(collection).readByQuery(query)
// 	return response.data as T
// }

// // Returns file url
// export function getImage(id: string): string {
// 	const directus = useDirectus()

// 	return `${directus.url}assets/${id}`
// }
