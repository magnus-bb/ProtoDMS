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
					<h1 class="mb-3 text-4xl font-bold">Sign in</h1>
					<p class="text-sm text-muted">Sign in to access your account</p>
				</div>
				<Form
					v-slot="{ meta: formMeta }"
					class="space-y-12"
					:validation-schema="schema"
					@submit="onSubmit"
				>
					<div class="space-y-4">
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
								<NuxtLink class="label-text-alt link link-hover">
									Forgot password?
								</NuxtLink>
							</label>
							<Field v-slot="{ meta, field }" name="password">
								<input
									id="password"
									type="password"
									v-bind="field"
									placeholder="example@example.com"
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
							:disabled="!formMeta.valid"
						>
							Sign in
						</button>
						<p class="px-6 text-sm text-center text-muted">
							Don't have an account yet?
							<NuxtLink class="link link-secondary font-semibold">
								Sign up
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
