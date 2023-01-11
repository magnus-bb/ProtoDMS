// import type { DirectusUsers as User } from '@/types/directus'

export interface SignUpFormData {
	first_name: string
	last_name: string
	email: string
	password: string
	confirm_password: string
}
export type SignUpFormDataPartial = Partial<SignUpFormData>

export interface SignInFormData {
	email: string
	password: string
}

export type SignInFormDataPartial = Partial<SignInFormData>
