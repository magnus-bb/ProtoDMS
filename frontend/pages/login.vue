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
				<Form class="space-y-12" @submit="onSubmit">
					<div class="space-y-4">
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">E-mail address</span>
							</label>
							<Field
								id="email"
								name="email"
								type="email"
								placeholder="example@example.com"
								class="input input-bordered w-full placeholder:text-muted"
							/>
							<ErrorMessage name="email" />
						</div>
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">Password</span>
								<NuxtLink class="label-text-alt link link-hover">
									Forgot password?
								</NuxtLink>
							</label>
							<Field
								id="password"
								type="password"
								name="password"
								placeholder="••••••••"
								class="input input-bordered w-full placeholder:text-muted"
							/>
							<ErrorMessage name="password" />
						</div>
					</div>
					<div class="space-y-2">
						<button role="submit" class="btn btn-accent btn-block">
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
import { Form, Field, ErrorMessage } from 'vee-validate'
import * as yup from 'yup'

console.log(yup)

interface FormData {
	email?: string
	password?: string
}

// const schema = Yup.object({
//   email_addr: Yup.string().email().required().label('Email Address'),
//   acc_pazzword: Yup.string().min(5).required().label('Your Password'),
// })

function onSubmit(values: FormData) {
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
</style>
