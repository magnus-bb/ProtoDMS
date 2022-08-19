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

				<Form
					v-slot="{ meta: formMeta }"
					class="space-y-12"
					:validation-schema="schema"
					@submit="onSubmit"
				>
					<div class="space-y-4">
						<!-- FIRST NAME -->
						<div v-if="!signInPage" class="form-control w-full">
							<label for="first-name" class="label">
								<span class="label-text">First name</span>
							</label>
							<Field v-slot="{ meta, field }" name="first-name">
								<input
									id="first-name"
									type="text"
									v-bind="field"
									placeholder="Jane/John"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
							</Field>
						</div>
						<!-- LAST NAME -->
						<div v-if="!signInPage" class="form-control w-full">
							<label for="last-name" class="label">
								<span class="label-text">Last name</span>
							</label>
							<Field v-slot="{ meta, field }" name="last-name">
								<input
									id="last-name"
									type="text"
									v-bind="field"
									placeholder="Doe"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
							</Field>
						</div>
						<!-- EMAIL -->
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">E-mail address</span>
							</label>
							<Field v-slot="{ meta, field }" name="email">
								<input
									id="email"
									type="email"
									v-bind="field"
									placeholder="example@example.com"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
							</Field>
						</div>
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">Password</span>
								<NuxtLink
									v-if="signInPage"
									class="label-text-alt link link-hover rounded"
									tabindex="0"
								>
									Forgot password?
								</NuxtLink>
							</label>
							<Field v-slot="{ meta, field }" name="password">
								<input
									id="password"
									type="password"
									v-bind="field"
									placeholder="••••••••"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
							</Field>
						</div>
						<div v-if="!signInPage" class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">Repeat password</span>
							</label>
							<Field v-slot="{ meta, field }" name="repeat-password">
								<input
									id="repeat-password"
									type="password"
									v-bind="field"
									placeholder="••••••••"
									class="input input-bordered w-full placeholder:text-muted transition-all"
									:class="{ 'input-error': meta.dirty && !meta.valid }"
								/>
							</Field>
						</div>
					</div>
					<div class="space-y-2">
						<button
							role="submit"
							class="btn btn-accent btn-block"
							:disabled="!formMeta.touched || !formMeta.valid"
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
import { string, object } from 'yup'
import { computed } from '#imports'

//* PAGE VERSION
const route = useRoute()
const routeName = route.name as 'signin' | 'signup' // lets us know whether we are signing in or signing up

// Are we on the signin version of the page?
const signInPage = computed<boolean>(() => routeName === 'signin')

definePageMeta({
	title: ' - Sign in', // TODO: do this inside signup as well and destructure the Signin component
	// keepalive: true, // When switching to sign up, we can keep the form filled
	// middleware: // if we are logged in, go to 'profile instead'
})

// TODO: FORM VALIDATION for both signin and signup. Rememeber that repeat pass should also be eq to pass
interface FormData {
	email?: string
	password?: string
}
type FormDataValidated = Required<FormData>

const schema = object({
	email: string().required().email().label('Your e-mail address'),
	password: string().required().min(8).label('Your password'),
})

function onSubmit(values: FormDataValidated) {
	// Navigate to front page on login if success: https://v3.nuxtjs.org/guide/directory-structure/pages/#programmatic-navigation
	console.log(values)
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
