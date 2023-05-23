<template>
	<main class="row p-4 flex flex-col gap-y-8">
		<div v-if="isOwnProfile && avatarUrl" class="indicator col-span-12 w-full max-w-md mx-auto">
			<button class="indicator-item right-12 top-12">
				<FileSelector name="picture" button circle size="lg" @input="updateAvatar">
					<Icon class="text-2xl weight-700 fill optical-size-40">edit</Icon>
				</FileSelector>
			</button>
			<img
				:src="avatarUrl"
				alt="User profile picture"
				class="aspect-square mask mask-squircle object-cover"
			/>
		</div>

		<img
			v-else-if="avatarUrl"
			:src="avatarUrl"
			alt="User profile picture"
			class="aspect-square mask mask-squircle object-cover col-span-12 w-full max-w-md mx-auto"
		/>

		<FileSelector
			v-else-if="isOwnProfile"
			center
			name="picture"
			button
			circle
			size="lg"
			title="Upload profile picture"
			@input="updateAvatar"
		>
			<Icon class="text-2xl weight-700 fill optical-size-40">photo_camera</Icon>
		</FileSelector>

		<div class="details-section mx-auto">
			<h2 class="[grid-area:name] sm:justify-self-end font-bold text-3xl sm:text-end">
				{{ fullName }}
			</h2>
			<h3
				v-if="user.title"
				class="[grid-area:title] sm:justify-self-end text-primary sm:text-end text-xl font-medium"
			>
				{{ user.title }}
			</h3>
			<h3
				v-if="user.location"
				class="[grid-area:location] sm:justify-self-end text-xl sm:text-end flex items-center gap-x-2"
			>
				{{ user.location }}
			</h3>

			<span v-if="user.organizational_id" class="[grid-area:id] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-300" aria-hidden>badge</Icon>
				{{ user.organizational_id }}
			</span>

			<span v-if="user.email" class="[grid-area:email] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-300" aria-hidden>alternate_email</Icon>
				<a class="link link-accent" :href="`mailto:${user.email}`">
					{{ user.email }}
				</a>
			</span>

			<span v-if="user.phone_number" class="[grid-area:phone] flex items-center gap-x-2">
				<Icon class="text-2xl optical-size-48 weight-300" aria-hidden>call</Icon>
				<a class="link link-accent" :href="`tel:${user.phone_number}`">{{ user.phone_number }}</a>
			</span>
		</div>

		<button
			v-if="isOwnProfile"
			class="btn btn-accent btn-wide btn-lg mx-auto"
			@click="showUpdateModal"
		>
			Edit profile
		</button>
		<Teleport to="#sidebar-content" :disabled="noSidebar">
			<h2 class="text-2xl font-semibold lg:text-center">Related items</h2>
			<div class="lg:px-3">
				<h3 class="text-lg font-semibold">Documents</h3>
				<div v-if="relatedDocuments.length" class="flex flex-wrap gap-2 mt-2">
					<NuxtLink
						v-for="relDoc of relatedDocuments"
						:key="relDoc.id"
						class="btn btn-sm btn-base-200"
						target="_blank"
						:to="`/documents/${relDoc.id}`"
					>
						{{ relDoc.title }}
					</NuxtLink>
				</div>
				<p v-else class="font-light italic">No related documents</p>
			</div>
			<div class="lg:px-3">
				<h3 class="text-lg font-semibold">Subscriptions</h3>
				<div v-if="subscriptions.length" class="flex flex-wrap gap-2 mt-2">
					<NuxtLink
						v-for="sub of subscriptions"
						:key="sub.id"
						class="btn btn-sm btn-base-200"
						target="_blank"
						:to="`/documents/${sub.id}`"
					>
						{{ sub.title }}
					</NuxtLink>
				</div>
				<p v-else class="font-light italic">No subscriptions</p>
			</div>
			<h2 class="text-2xl font-semibold lg:text-center">Contributions</h2>
			<CalendarHeatmap
				class="w-full max-w-[200px] lg:mx-auto"
				:round="2"
				:values="contributions"
				:end-date="new Date()"
				vertical
				:range-color="heatmapColors"
				:max="maxHeatmapColor"
			/>
		</Teleport>
	</main>

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
	<Modal
		v-if="isOwnProfile"
		:class="{ 'modal-open': updateModalShown }"
		sidebar-safe
		@hide="hideUpdateModal"
	>
		<template #heading>Edit profile</template>

		<Form
			v-slot="{ meta: formMeta, isSubmitting }"
			ref="form"
			class="profile-form gap-x-4"
			:validation-schema="schema"
			:initial-values="userFormData"
			@input="showAlert = false"
			@submit="onSubmitDetails"
		>
			<!-- EMAIL -->
			<Field v-slot="{ meta, field, errorMessage }" name="email" as="div" class="col-span-2">
				<label for="email" class="label">
					<span class="label-text">E-mail address</span>
				</label>
				<div class="indicator w-full">
					<span class="indicator-item indicator-bottom indicator-center badge">Required</span>
					<label class="input-group">
						<Icon class="optical-size-40">alternate_email</Icon>
						<input
							id="email"
							type="text"
							v-bind="field"
							placeholder="example@example.com"
							class="input input-bordered w-full placeholder:text-muted transition-all"
							:class="{ 'input-error': meta.dirty && !meta.valid }"
						/>
					</label>
				</div>
				<label class="label">
					<span :class="{ invisible: !errorMessage }" class="label-text-alt text-error">{{
						errorMessage
					}}</span>
					<span class="label-text-alt">This is used for logging in</span>
				</label>
			</Field>
			<!-- FIRST NAME -->
			<Field v-slot="{ meta, field, errorMessage }" name="first_name" as="div">
				<label for="first_name" class="label">
					<span class="label-text">First name</span>
				</label>
				<div class="indicator w-full">
					<span class="indicator-item indicator-bottom indicator-center badge">Required</span>
					<input
						id="first_name"
						type="text"
						v-bind="field"
						placeholder="Jane/John"
						class="input input-bordered w-full placeholder:text-muted transition-all"
						:class="{ 'input-error': meta.dirty && !meta.valid }"
					/>
				</div>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>
			<!-- LAST NAME -->
			<Field v-slot="{ meta, field, errorMessage }" name="last_name" as="div">
				<label for="last_name" class="label">
					<span class="label-text">Last name</span>
				</label>
				<input
					id="last_name"
					type="text"
					v-bind="field"
					placeholder="Doe"
					class="input input-bordered w-full placeholder:text-muted transition-all"
					:class="{ 'input-error': meta.dirty && !meta.valid }"
				/>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>
			<!-- JOB TITLE -->
			<Field v-slot="{ meta, field, errorMessage }" name="title" as="div">
				<label for="title" class="label">
					<span class="label-text">Job title</span>
				</label>
				<label class="input-group">
					<Icon class="optical-size-40">work</Icon>
					<input
						id="title"
						type="text"
						v-bind="field"
						placeholder="Programmer"
						class="input input-bordered w-full placeholder:text-muted transition-all"
						:class="{ 'input-error': meta.dirty && !meta.valid }"
					/>
				</label>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>
			<!-- DEPARTMENT -->
			<Field v-slot="{ meta, field, errorMessage }" name="location" as="div">
				<label for="location" class="label">
					<span class="label-text">Department</span>
				</label>
				<label class="input-group">
					<Icon class="optical-size-40">location_on</Icon>
					<input
						id="location"
						type="text"
						v-bind="field"
						placeholder="R&D office"
						class="input input-bordered w-full placeholder:text-muted transition-all"
						:class="{ 'input-error': meta.dirty && !meta.valid }"
					/>
				</label>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>
			<!-- ORGANIZATIONAL ID -->
			<Field v-slot="{ meta, field, errorMessage }" name="organizational_id" as="div">
				<label for="organizational_id" class="label">
					<span class="label-text">Organizational ID</span>
				</label>
				<label class="input-group">
					<Icon class="optical-size-40">badge</Icon>
					<input
						id="organizational_id"
						type="text"
						v-bind="field"
						placeholder="1234-5678"
						class="input input-bordered w-full placeholder:text-muted transition-all"
						:class="{ 'input-error': meta.dirty && !meta.valid }"
					/>
				</label>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>
			<!-- PHONE NUMBER -->
			<Field v-slot="{ meta, field, errorMessage }" name="phone_number" as="div">
				<label for="phone_number" class="label">
					<span class="label-text">Phone number</span>
				</label>
				<label class="input-group">
					<Icon class="optical-size-40">call</Icon>
					<input
						id="phone_number"
						type="text"
						v-bind="field"
						placeholder="+45 12 34 56 78"
						class="input input-bordered w-full placeholder:text-muted transition-all"
						:class="{ 'input-error': meta.dirty && !meta.valid }"
					/>
				</label>
				<label :class="{ invisible: !errorMessage }" class="label">
					<span class="label-text-alt text-error">{{ errorMessage }}</span>
				</label>
			</Field>

			<!-- disable submit btn if the form is not touched, not valid, not changed or if we are already submitting a request -->
			<button
				role="submit"
				:disabled="!formMeta.valid || !formMeta.dirty || isSubmitting"
				class="btn btn-block btn-accent col-span-2 row-start-5"
				@click="updateProfile"
			>
				Save changes
			</button>
		</Form>
	</Modal>
</template>

<script setup lang="ts">
import { Form, Field } from 'vee-validate'
import { string, object } from 'yup'
import 'vue3-calendar-heatmap/dist/style.css'
import { CalendarHeatmap } from 'vue3-calendar-heatmap'
import { breakpointsTailwind } from '@vueuse/core'
import type { Documents as Document, DirectusUsers as DirectusUser } from '@/types/directus'

definePageMeta({
	layout: 'sidebar',
})
const {
	params: { id: userId },
} = useRoute()

const me = await getUser()

const isOwnProfile = $computed<boolean>(() => userId === 'me' || userId === me.id)

//* USER INFORMATION
let user = $ref<DirectusUser>(await getUserData(userId as string)) // when userId is 'me', it works perfectly fine since Directus uses the route /users/me as well
async function refreshUserData() {
	user = await getUserData(userId as string)
}

const avatarUrl = $computed<string | undefined>(() => {
	if (!user.avatar) return
	return getAssetUrl(user.avatar as string)
})

const fullName = $computed<string>(() => {
	return [user?.first_name, user?.last_name].filter(name => name).join(' ')
})

//* RELATIONAL INFORMATION
const relatedDocuments = $computed<Document[]>(() => {
	// Since some related documents can be private, and a user can technically be related to a private doc they can't see, we need to filter out the null values here
	return user?.related_documents?.map(rel => rel.document_id as Document).filter(doc => doc) ?? []
})

const subscriptions = $computed<Document[]>(() => {
	// Since some related documents can be private, and a user can technically be subscribed to a private doc they can't see, we need to filter out the null values here
	return user?.subscriptions?.map(rel => rel.documents_id as Document).filter(doc => doc) ?? []
})

//* FORM
const form = ref<typeof Form>() // Form component with VeeValidate methods

const schema = object({
	first_name: string().trim().required().label('Your first name'),
	last_name: string().trim().label('Your last name'),
	title: string().trim().label('Your job title'),
	location: string().trim().label('Your department'),
	organizational_id: string().label('Your organizational ID'),
	email: string().email().required().label('Your e-mail address'),
	phone_number: string().label('Your phone number'),
})

// These are just the relevant form fields from the user object, which is used to reset and set initial form values
// These will change when updates are made, and a new user object is fetched
const userFormData = $computed<Partial<DirectusUser>>(() => ({
	first_name: user.first_name,
	last_name: user.last_name,
	title: user.title,
	location: user.location,
	organizational_id: user.organizational_id,
	email: user.email,
	phone_number: user.phone_number,
}))

// This resets the values in the form to what is currently in the user object from Directus (i.e. the currently saved state)
function resetFormData() {
	form.value?.resetForm(userFormData)
}

async function onSubmitDetails(formData: Partial<DirectusUser>) {
	try {
		await updateUser(user.id, formData)
	} catch (err) {
		console.error(err)

		displayErrorMessage('There was an error updating your profile details')
	}

	hideUpdateModal()
	refreshUserData()
}

//* ERROR MESSAGE
let showAlert = $ref<boolean>(false)
let submissionErrorText = $ref<string>('')

function displayErrorMessage(msg: string) {
	submissionErrorText = msg
	showAlert = true
}

//* MODAL
let updateModalShown = $ref(false)
function showUpdateModal() {
	resetFormData()

	updateModalShown = true
}

function hideUpdateModal() {
	updateModalShown = false
}

//* AVATAR UPDATE
async function updateAvatar(e: Event) {
	e.preventDefault()

	if (!isOwnProfile) return

	const file = (e.target as HTMLInputElement).files?.[0]
	if (!file) return

	try {
		await updateUserAvatar(user.id, file)
	} catch (err) {
		console.error(err)

		displayErrorMessage('There was an error updating your profile picture')
	}

	refreshUserData()
}

//* CONTRIBUTION HEATMAP
const contributions = await getUserAggregatedDocumentActivity(user.id)

const { $theme } = useNuxtApp()
const heatmapColors: string[] = [$theme['base-300'], $theme['base-300']]
const maxHeatmapColor = 7

for (let i = 1; i <= maxHeatmapColor; i++) {
	heatmapColors.push(blendColors($theme.neutral, $theme.secondary, i / maxHeatmapColor))
}

//* SIDEBAR
const breakpoints = useBreakpoints(breakpointsTailwind)
const noSidebar = breakpoints.smallerOrEqual('lg')
</script>

<style lang="postcss" scoped>
.details-section {
	@apply grid grid-cols-1 grid-rows-6 gap-x-8 gap-y-1 items-center;

	grid-template-areas:
		'name'
		'title'
		'location'
		'id'
		'email'
		'phone';

	@screen sm {
		@apply grid-cols-2 grid-rows-3;
		/* stylelint-disable */
		grid-template-areas:
			'name	id'
			'title email'
			'location phone';
		/* stylelint-enable */
	}
}

.profile-form {
	@apply grid grid-cols-2 grid-rows-5 items-center;
}

/* Just fixes a small bug with the vertical version of the heatmap component */
.vch__container :deep(.vch__legend) {
	display: none;
}
</style>
