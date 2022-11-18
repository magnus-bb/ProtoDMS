<template>
	<main class="grow xs:grid xs:place-items-center">
		<div class="mockup-window border dark:border-neutral bg-base-200 dark:bg-base-300 shadow-xl">
			<code class="absolute top-8 left-24 tracking-wider leading-none -translate-y-3.5">
				shouldiuse.exe
			</code>

			<div class="bg-base-100 dark:bg-base-200 p-6 w-full">
				<div class="mb-8 text-center">
					<h1 class="mb-3 text-4xl font-bold">Sign {{ signInPage ? 'in' : 'up' }}</h1>
					<p class="text-sm text-muted">
						{{ signInPage ? 'Sign in to access your account' : 'Create an account' }}
					</p>
				</div>

				<Form
					v-slot="{ meta: formMeta, isSubmitting }"
					class="space-y-8"
					:validation-schema="schema"
					@input="showAlert = false"
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
									<span class="label-text-alt text-error">{{ errorMessage }}</span>
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
									<span class="indicator-item indicator-center badge">Optional</span>
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
									<span class="label-text-alt text-error">{{ errorMessage }}</span>
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
								<label v-if="!signInPage" :class="{ invisible: !errorMessage }" class="label">
									<span class="label-text-alt text-error">{{ errorMessage }}</span>
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
									<NuxtLink class="label-text-alt link link-hover rounded" tabindex="0">
										Forgot password?
									</NuxtLink>
								</label>
								<label v-else :class="{ invisible: !errorMessage }" class="label">
									<span class="label-text-alt text-error">{{ errorMessage }}</span>
								</label>
							</Field>
						</div>

						<!-- CONFIRM PASSWORD -->
						<div v-if="!signInPage" class="form-control w-full">
							<Field v-slot="{ meta, field, errorMessage }" name="confirm_password">
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
									<span class="label-text-alt text-error">{{ errorMessage }}</span>
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

		<div v-show="showAlert" class="toast">
			<div class="alert alert-error shadow-lg mb-4">
				<div>
					<Icon class="text-2xl -grade-25">block</Icon>
					<h4 class="text-sm">{{ submissionErrorText }}</h4>
				</div>
				<div class="flex-none">
					<button class="btn btn-sm" @click="showAlert = false">Alright</button>
				</div>
			</div>
		</div>
	</main>
</template>

<script lang="ts" setup>
import { Form, Field } from 'vee-validate'
import { string, object, ref as reference } from 'yup'
import type { SignInFormDataValidated, SignUpFormDataValidated } from '@/types/auth'

//* PAGE VERSION
const route = useRoute()
const routeName = route.name as 'signin' | 'signup' // lets us know whether we are signing in or signing up

// Are we on the signin version of the page?
const signInPage = computed<boolean>(() => routeName === 'signin')

useHead({
	titleTemplate(titleChunk: string): string {
		return `${titleChunk} - Sign ${signInPage.value ? 'in' : 'up'}`
	},
})

//* FORM VALIDATION (client only)
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
const SIGN_IN_ERROR_MESSAGE = 'Your e-mail or password is incorrect'
const SIGN_UP_ERROR_MESSAGE = 'Could not register account'

const submissionErrorText = ref<string>('')
const showAlert = ref<boolean>(false)

//* SUBMISSION
async function onSubmit(formData: unknown) {
	try {
		if (signInPage.value) {
			await login(formData as SignInFormDataValidated)
		} else {
			const { authenticatedRoleId } = useRuntimeConfig().public
			/* eslint-disable camelcase */
			const { first_name, last_name, email, password } = formData as SignUpFormDataValidated

			// nuxt-directus uses a wrong type for registering arg, so we ignore ts errors
			const success = await register({
				// @ts-ignore
				first_name,
				// @ts-ignore
				last_name,
				email,
				password,
				role: authenticatedRoleId, // only role that can be set, so this is safe
			})

			if (!success) {
				// nuxt-directus does not throw error if register fails (like it does with login),
				// so we just do it manually to be consistent with handling errors in the catch-block
				throw new Error(SIGN_UP_ERROR_MESSAGE)
			}

			/* eslint-enable camelcase */

			// TODO: LOGIN AFTER SIGN UP
		}
	} catch (err) {
		if (signInPage.value) {
			displayErrorMessage(SIGN_IN_ERROR_MESSAGE)
		} else {
			displayErrorMessage(SIGN_UP_ERROR_MESSAGE)
		}

		return
	}

	await navigateTo('/')
}

function displayErrorMessage(msg: typeof SIGN_IN_ERROR_MESSAGE | typeof SIGN_UP_ERROR_MESSAGE) {
	submissionErrorText.value = msg
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
