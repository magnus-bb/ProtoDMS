import type { DirectusUsers as User } from '@/types/directus'

export interface SignUpFormData
	extends Pick<User, 'first_name' | 'last_name' | 'email' | 'password'> {
	confirm_password?: string
}
export type SignUpFormDataValidated = Required<SignUpFormData>
export type SignInFormData = Pick<SignUpFormData, 'email' | 'password'>
export type SignInFormDataValidated = Required<SignInFormData>
