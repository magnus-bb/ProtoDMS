<template>
	<main class="grow xs:grid xs:place-items-center">
		<div
			class="mockup-window border dark:border-neutral bg-base-200 dark:bg-base-300 shadow-xl"
		>
			<code
				class="absolute top-8 left-24 tracking-wider leading-none -translate-y-3.5"
			>
				shouldiuse.exe
			</code>

			<div class="bg-base-100 dark:bg-base-200 p-6 w-full">
				<div class="mb-8 text-center">
					<h1 class="mb-3 text-4xl font-bold">
						Sign {{ signInPage ? 'in' : 'up' }}
					</h1>
					<p class="text-sm text-muted">
						{{
							signInPage
								? 'Sign in to access your account'
								: 'Create an account'
						}}
					</p>
				</div>

				<div v-show="showAlert" class="alert alert-error shadow-inner mb-4">
					<div>
						<Icon class="text-2xl grade-100">block</Icon>
						<span>{{ submissionErrorText }}</span>
					</div>
				</div>

				<Form
					v-slot="{ meta: formMeta, isSubmitting }"
					class="space-y-8"
					:validation-schema="schema"
					@submit="onSubmit"
				>
					<div :class="signInPage ? 'space-y-4' : 'space-y-2'">
						<!-- FIRST NAME -->
						<div v-if="!signInPage" class="form-control w-full">
							<Field v-slot="{ meta, field, errorMessage }" name="first_name">
								<label for="first_name" class="label">
									<span class="label-text">First name</span>
								</label>
								<input
									id="first_name"
									type="text"
									v-bind="field"
									placeholder="Jane/John"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
								<label :class="{ invisible: !errorMessage }" class="label">
									<span class="label-text-alt text-error">{{
										errorMessage
									}}</span>
								</label>
							</Field>
						</div>

						<!-- LAST NAME -->
						<div v-if="!signInPage" class="form-control w-full">
							<Field v-slot="{ meta, field, errorMessage }" name="last_name">
								<label for="last_name" class="label">
									<span class="label-text">Last name</span>
								</label>
								<div class="indicator w-full">
									<span class="indicator-item indicator-center badge"
										>Optional</span
									>
									<input
										id="last_name"
										type="text"
										v-bind="field"
										placeholder="Doe"
										class="input input-bordered w-full placeholder:text-muted transition-all"
										:class="{ 'input-error': meta.dirty && !meta.valid }"
									/>
								</div>
								<label :class="{ invisible: !errorMessage }" class="label">
									<span class="label-text-alt text-error">{{
										errorMessage
									}}</span>
								</label>
							</Field>
						</div>

						<!-- EMAIL -->
						<div class="form-control w-full">
							<Field v-slot="{ meta, field, errorMessage }" name="email">
								<label for="email" class="label">
									<span class="label-text">E-mail address</span>
								</label>
								<input
									id="email"
									type="email"
									v-bind="field"
									placeholder="example@example.com"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
								<label
									v-if="!signInPage"
									:class="{ invisible: !errorMessage }"
									class="label"
								>
									<span class="label-text-alt text-error">{{
										errorMessage
									}}</span>
								</label>
							</Field>
						</div>

						<!-- PASSWORD -->
						<div class="form-control w-full">
							<Field v-slot="{ meta, field, errorMessage }" name="password">
								<label for="email" class="label">
									<span class="label-text">Password</span>
								</label>
								<input
									id="password"
									type="password"
									v-bind="field"
									placeholder="••••••••"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
								<label v-if="signInPage" class="label">
									<NuxtLink
										class="label-text-alt link link-hover rounded"
										tabindex="0"
									>
										Forgot password?
									</NuxtLink>
								</label>
								<label
									v-else
									:class="{ invisible: !errorMessage }"
									class="label"
								>
									<span class="label-text-alt text-error">{{
										errorMessage
									}}</span>
								</label>
							</Field>
						</div>

						<!-- CONFIRM PASSWORD -->
						<div v-if="!signInPage" class="form-control w-full">
							<Field
								v-slot="{ meta, field, errorMessage }"
								name="confirm_password"
							>
								<label for="confirm_password" class="label">
									<span class="label-text">Confirm password</span>
								</label>
								<input
									id="confirm_password"
									type="password"
									v-bind="field"
									placeholder="••••••••"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
								<label :class="{ invisible: !errorMessage }" class="label">
									<span class="label-text-alt text-error">{{
										errorMessage
									}}</span>
								</label>
							</Field>
						</div>
					</div>

					<div class="space-y-2">
						<button
							role="submit"
							class="btn btn-accent btn-block"
							:disabled="!formMeta.touched || !formMeta.valid || isSubmitting"
						>
							Sign {{ signInPage ? 'in' : 'up' }}
						</button>
						<p class="px-6 text-sm text-center text-muted">
							<span v-if="signInPage">Don't have an account yet? </span>
							<span v-else>Already have an account? </span>
							<NuxtLink
								v-if="signInPage"
								tabindex="0"
								class="link link-secondary font-semibold rounded"
								to="/signup"
							>
								Sign up</NuxtLink
							>
							<NuxtLink
								v-else
								tabindex="0"
								class="link link-secondary font-semibold rounded"
								to="/signin"
								>Sign in
							</NuxtLink>
						</p>
					</div>
				</Form>
			</div>
		</div>
	</main>
</template>

<script lang="ts" setup>
import { Form, Field } from 'vee-validate'
import { string, object, ref as reference } from 'yup'
import type { DirectusUsers as User } from '@/types/directus'
const { login, register } = useDirectusAuth()

//* PAGE VERSION
const route = useRoute()
const routeName = route.name as 'signin' | 'signup' // lets us know whether we are signing in or signing up

// Are we on the signin version of the page?
const signInPage = computed<boolean>(() => routeName === 'signin')

useHead({
	titleTemplate(titleChunk) {
		return `${titleChunk} - Sign ${signInPage.value ? 'in' : 'up'}`
	},
})

// FORM VALIDATION (client only)
// interface SignUpFormData {
// 	first_name?: string
// 	last_name?: string
// 	email?: string
// 	password?: string
// 	confirm_password?: string
// }
interface SignUpFormData
	extends Pick<User, 'first_name' | 'last_name' | 'email' | 'password'> {
	confirm_password?: string
}
type SignUpFormDataValidated = Required<SignUpFormData>
type SignInFormData = Pick<SignUpFormData, 'email' | 'password'>
type SignInFormDataValidated = Required<SignInFormData>

const schema = computed(() => {
	const schema = object({
		first_name: string().required().label('Your first name'),
		last_name: string().label('Your last name'),
		email: string().required().email().label('Your e-mail address'),
		// The min length is only used for sign up
		password: string()
			.required()
			.min(signInPage.value ? 0 : 8)
			.label('Your password'),
		confirm_password: string()
			.required()
			.oneOf([reference('password')], "Passwords don't match")
			.label('The repeated password'),
	})

	return signInPage.value ? schema.pick(['email', 'password']) : schema
})

//* SUBMISSION ERROR
const submissionErrorText = ref<string>('')
const showAlert = ref<boolean>(false)
const SIGN_IN_ERROR_MESSAGE = 'Your e-mail or password is incorrect'

//* SUBMISSION
async function onSubmit(formData: unknown) {
	try {
		if (signInPage.value) {
			await login(formData as SignInFormDataValidated)
		} else {
			//! TODO: register with an API (backend) call that uses a static token for admin privileges so new users can be created as User
			/* eslint-disable camelcase */
			// const { first_name, last_name, email, password } =
			// 	formData as SignUpFormDataValidated
			// register({ first_name, last_name, email, password, role: 'admin' })
			/* eslint-enable camelcase */
		}
	} catch (err) {
		if (signInPage.value) {
			showSignInError()
		} else {
			// Sign up error
		}

		return
	}

	await navigateTo('/')
}

function showSignInError() {
	submissionErrorText.value = SIGN_IN_ERROR_MESSAGE
	showAlert.value = true
}
</script>

<style lang="postcss" scoped>
.mockup-window {
	@apply w-full;

	@screen xs {
		width: clamp(23rem, 35vw, 28rem);
	}
}

/* .input {
	transition: outline-color 200ms ease-in-out;
} */
</style>
