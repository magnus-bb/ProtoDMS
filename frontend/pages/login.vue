<template>
	<main class="grow xs:grid xs:place-items-center">
		<div
			class="mockup-window border dark:border-neutral bg-base-200 dark:bg-base-300 shadow-xl"
		>
			<div class="bg-base-100 dark:bg-base-200 p-6 w-full">
				<div class="mb-8 text-center">
					<h1 class="mb-3 text-4xl font-bold">Sign in</h1>
					<p class="text-sm text-muted">Sign in to access your account</p>
				</div>
				<form class="space-y-12">
					<div class="space-y-4">
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">E-mail address</span>
							</label>
							<input
								id="email"
								name="email"
								type="email"
								placeholder="example@example.com"
								class="input input-bordered w-full placeholder:text-muted"
							/>
						</div>
						<div class="form-control w-full">
							<label for="email" class="label">
								<span class="label-text">Password</span>
								<NuxtLink class="label-text-alt link link-hover">
									Forgot password?
								</NuxtLink>
							</label>
							<input
								id="password"
								type="password"
								name="password"
								placeholder="••••••••"
								class="input input-bordered w-full placeholder:text-muted"
							/>
						</div>
					</div>
					<div class="space-y-2">
						<button class="btn btn-super btn-block">Sign in</button>
						<p class="px-6 text-sm text-center text-muted">
							Don't have an account yet?
							<NuxtLink class="link link-accent">Sign up</NuxtLink>
						</p>
					</div>
				</form>
			</div>
		</div>
	</main>
</template>

<style lang="postcss" scoped>
.mockup-window {
	@apply w-full;
	@screen xs {
		width: clamp(23rem, 35vw, 28rem);
	}
}
</style>
