<template>
	<div class="p-4 flex flex-col">
		<div class="flex">
			<div class="flex gap-4 flex-1 mb-4">
				<!-- SEARCH -->
				<div class="form-control">
					<label for="search" class="sr-only">Search documents</label>
					<div class="input-group">
						<input
							id="search"
							ref="searchInput"
							v-model="search"
							type="search"
							name="search"
							aria-label="Search input"
							class="input input-bordered placeholder:text-muted"
							placeholder="Search documents"
						/>
						<Icon class="text-2xl optical-size-40 grade-100">search</Icon>
					</div>
				</div>

				<!-- TAGS -->
				<FilterSelect
					v-model="tags"
					name="tags"
					:options="allTags"
					multiple
					hover
					label-prop="name"
					emit-prop="id"
					class="border-0 bg-base-300"
				>
					Tags
				</FilterSelect>
				<!-- <pre>{{ allTags }}</pre> -->
			</div>

			<!-- <div v-if="selectedDocs.length" class="flex-1"> -->
			<div class="flex-1">
				<div>content</div>
				<!-- RIGHT -->
				<!-- SELECTED DOCUMENT ACTIONS -->
			</div>
		</div>

		<div class="divider mb-8" />

		<main class="space-y-8">
			<div class="document-grid">
				<!-- TOP -->
				<!-- DOCUMENTS -->
				<div v-for="doc of documents" :key="doc.id" class="card shadow-xl bg-base-200">
					<div class="card-body">
						<h2 class="card-title">{{ doc.title }}</h2>
						<div class="divider my-0" />

						<!-- MUST use a wrapper to get v-once working correctly with :content so quill does not keep failing updates
						when searching which calls a diff check that fails -->
						<QuillReadOnly :content="new Delta(doc.content as any)" />

						<div class="card-actions grid items-center grid-cols-[1fr_auto]">
							<!-- TAGS -->
							<div class="flex flex-wrap gap-2">
								<span
									v-for="tag of (doc.tags as DocumentTag[])"
									:key="tag.id"
									class="badge badge-outline badge-secondary"
									>{{ (tag.tags_id as Tag)?.name }}</span
								>
							</div>
							<!-- SUBSCRIBERS -->
							<div
								class="tooltip tooltip-bottom"
								:data-tip="'Subscribers: ' + 
									new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format((doc.subscribers as DocumentSubscriber[]).map(sub => (sub.directus_users_id as DirectusUser)).map(({ first_name, last_name }) =>
										[first_name, last_name].filter(name => name).join(' ')
									))
								"
							>
								<div class="avatar-group -space-x-5 cursor-default self-end">
									<Avatar
										v-for="sub of (doc.subscribers as DocumentSubscriber[])"
										:key="sub.id"
										:user="(sub.directus_users_id as Partial<DirectusUser>)"
										:avatar-options="{ key: 'user-badge' }"
										class="w-8 text-sm outline-secondary"
										avatar-class="border-2 border-secondary"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<pre>{{ documents }}</pre>

			<div>
				<!-- BOTTOM -->
				<!-- CREATE BUTTON -->
				<div class="flex">
					<button class="btn btn-circle btn-accent btn-lg">
						<Icon class="text-4xl fill optical-size-40 grade-100">note_add</Icon>
					</button>
				</div>
			</div>
		</main>
	</div>

	<!-- CREATE DOCUMENT MODAL -->
	<input
		id="create-document-modal"
		ref="createDocumentModal"
		type="checkbox"
		class="modal-toggle"
	/>
	<label for="create-document-modal" class="modal">
		<label class="modal-box relative">
			<label for="create-document-modal" class="btn btn-sm btn-circle absolute right-2 top-2">
				<Icon class="text-xl optical-size-24 grade-100">close</Icon>
			</label>

			<h3 class="text-lg font-bold mb-4">Create document</h3>
		</label>
	</label>
</template>

<script setup lang="ts">
// try wrapping in an async component that waits for the quill editor to load and then use that comp with v-once (can this be functional comp?)
import { QuillEditor, Delta } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
// import { h } from 'vue'
import type {
	Documents as Document,
	Tags as Tag,
	DocumentsTags as DocumentTag,
	DocumentsDirectusUsers as DocumentSubscriber,
	DirectusUsers as DirectusUser,
} from '@/types/directus'

const SEARCH_DEBOUNCE_MS = 300 // How long to wait after typing in search bar before sending request

//* INITIALIZE SEARCH STATE
const route = useRoute()
const search = $ref<string>((route.query.search as string) || '')
// Make sure the url tags are always parsed as an array of numbers (ids)
const tags = $ref<number[]>(
	route.query.tags?.length ? parseArray<number>(route.query.tags as string | string[]) : []
)
const allTags = await readAll<Tag>('tags')

//* SEARCH
let documents = $ref<Document[]>([])
await executeSearch()

async function executeSearch() {
	// When a search is executed, reflect it in the URL
	const router = useRouter()
	router.replace({ query: formatUrlQuery() })

	const res = await query<Document>('documents', {
		search,
		// If there are not selectedTags, set filter to null, since _in doesn't work with empty arrays
		filter: tags.length
			? {
					tags: {
						tags_id: {
							_in: tags,
						},
					},
			  }
			: null,
		fields: [
			'*',
			'subscribers.directus_users_id.avatar',
			'subscribers.directus_users_id.first_name',
			'subscribers.directus_users_id.last_name',
			'tags.id',
			'tags.tags_id.*',
		],
		sort: ['title', 'tags'],
		limit: -1,
	})

	documents = res
}

// Creates an object of search state (search term etc) that can be passed to router.replace
function formatUrlQuery(): Record<string, any> {
	return removeEmpty({
		search,
		tags,
	})
}

//* SEARCH WATCHERS
const searchInput = $ref<HTMLInputElement>()
onStartTyping(() => {
	searchInput?.focus()
})

// Execute search when search input changes
watchDebounced($$(search), executeSearch, {
	debounce: SEARCH_DEBOUNCE_MS,
	maxWait: 2000,
})

// Execute search when tags change
watch($$(tags), executeSearch)

//* DOCUMENT SELECTION
const { selected: selectedDocs, select: selectDoc } = useSelection<Document>()
</script>

<style scoped lang="postcss">
.document-grid {
	@apply grid gap-6;

	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

:deep() {
	.ql-toolbar {
		@apply hidden;
	}

	.ql-editor {
		@apply p-0 line-clamp-[10];
	}

	.ql-blank::before {
		@apply !text-muted !font-bold;
	}
}
</style>
