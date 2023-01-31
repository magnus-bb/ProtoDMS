<template>
	<div class="p-4 flex flex-col">
		<div class="grid gap-x-4 gap-y-2 items-center grid-flow-col grid-rows-4 md:grid-rows-2">
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
						class="input input-bordered placeholder:text-muted w-full"
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

			<div class="md:justify-self-end">
				<kbd class="kbd kbd-sm">ctrl</kbd>
				+
				<kbd class="kbd kbd-sm">click</kbd>
				to select multiple files
			</div>

			<!-- SELECTED DOCUMENT ACTIONS -->
			<div class="md:justify-self-end flex gap-x-2">
				<div class="dropdown dropdown-hover">
					<button
						:class="{ 'btn-secondary bg-secondary/50': selectedDocs.length }"
						class="btn border-none text-xl sm:text-2xl gap-x-1"
					>
						<Icon class="weight-700 fill optical-size-40">{{
							selectedDocs.length > 1 ? 'file_copy' : 'draft'
						}}</Icon>
						<Icon class="weight-700 fill optical-size-40">arrow_drop_down</Icon>
					</button>

					<ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-300 rounded-box w-full">
						<!-- create document -->
						<li class="items-center text-xl sm:text-2xl" title="New document">
							<button @click="showCreateModal">
								<Icon class="weight-700 fill optical-size-40">note_add</Icon>
							</button>
						</li>
						<!-- edit document-->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Edit title & content"
						>
							<NuxtLink target="_blank" :to="`/documents/${selectedDocs[0].id}`">
								<Icon class="weight-700 fill optical-size-40">edit_document</Icon>
							</NuxtLink>
						</li>
						<!-- edit tags -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Edit tags"
						>
							<button @click="showTagsModal">
								<Icon class="weight-700 fill optical-size-40">sell</Icon>
							</button>
						</li>
						<!-- edit subscribers -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Edit subscribers"
						>
							<button v-if="selectedDocs.length" @click="showSubsModal">
								<Icon class="weight-700 fill optical-size-40">group_add</Icon>
							</button>
						</li>
						<!-- delete documents -->
						<li
							v-if="selectedDocs.length"
							class="items-center text-xl sm:text-2xl"
							title="Delete document(s)"
						>
							<button @click="deleteSelectedDocuments">
								<Icon class="weight-700 fill optical-size-40 text-error">delete</Icon>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="divider mb-8" />

		<main v-if="documents?.length" class="space-y-8">
			<div class="document-grid">
				<!-- TOP -->
				<!-- DOCUMENTS -->
				<DocumentPreview
					v-for="doc of documents"
					:key="doc.id"
					:class="{ 'bg-secondary/30': selectedDocs.includes(doc) }"
					class="cursor-default shadow-xl hover:shadow-2xl focus:shadow-2xl bg-base-200"
					:document="doc"
					@click="selectDoc(doc)"
				/>
			</div>

			<!-- CREATE BUTTON -->
			<div class="flex justify-center">
				<button class="btn btn-circle btn-accent btn-lg" @click="showCreateModal">
					<Icon class="text-4xl fill optical-size-40 grade-100">note_add</Icon>
				</button>
			</div>
		</main>
	</div>

	<!-- CREATE DOCUMENT MODAL -->
	<div class="modal modal-bottom md:modal-middle" :class="{ 'modal-open': documentModalShown }">
		<div v-on-click-outside="hideModal" class="modal-box !max-w-2xl overflow-y-visible">
			<button class="btn btn-sm btn-circle absolute right-2 top-2" @click="hideModal">
				<Icon class="text-xl optical-size-24 grade-100">close</Icon>
			</button>

			<h3 v-if="creatingDocument" class="text-lg font-bold mb-4">Create document</h3>
			<h3 v-else-if="editingTags" class="text-lg font-bold mb-4">Select tags</h3>
			<h3 v-else-if="editingSubs" class="text-lg font-bold mb-4">Select users</h3>

			<div class="grid gap-y-2">
				<div v-if="creatingDocument">
					<div class="form-control">
						<label for="title" class="label"><span class="label-text">Title</span></label>
						<input
							id="title"
							v-model="editTitleValue"
							placeholder="Document title"
							class="input input-bordered placeholder:text-muted"
						/>
					</div>
				</div>
				<div v-if="editingTags">
					<label v-if="creatingDocument" for="edit-tags" class="label">
						<span class="label-text">Tags</span>
					</label>
					<FilterSelect
						v-model="editTagsValue"
						name="edit-tags"
						:options="allTags"
						multiple
						label-prop="name"
						emit-prop="id"
						class="border-0"
					>
						Tags
					</FilterSelect>
				</div>
				<div v-if="editingSubs">
					<label v-if="creatingDocument" for="edit-subs" class="label">
						<span class="label-text">Subscribers</span>
					</label>
					<UserSelector v-model="editSubsValue" :options="allUsers" class="flex flex-col gap-y-2" />
				</div>
				<div class="mt-4">
					<button
						v-if="creatingDocument"
						class="btn btn-block btn-accent gap-x-2"
						:disabled="!editTitleValue.length"
						@click="newDocument"
					>
						<Icon class="weight-700 fill optical-size-40 text-lg">note_add</Icon>
						<span>Create document</span>
					</button>
					<button
						v-else-if="editingTags"
						class="btn btn-block btn-accent gap-x-2"
						:disabled="!editTagsValueChanged"
						@click="updateSelectedDocumentTags"
					>
						<Icon class="weight-700 fill optical-size-40 text-lg">sell</Icon>
						<span>Set tags</span>
					</button>
					<button
						v-else-if="editingSubs"
						class="btn btn-block btn-accent gap-x-2"
						:disabled="!editSubsValueChanged"
						@click="updateSelectedDocumentSubs"
					>
						<Icon class="weight-700 fill optical-size-40 text-lg">group_add</Icon>
						<span>Set subscribers</span>
					</button>
					<!-- TODO: when updating tags or subs, only enable button when the values are not the same as selectedDocs.value[0] -->
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { vOnClickOutside } from '@vueuse/components'
import type {
	Documents as Document,
	DirectusUsers as DirectusUser,
	DocumentsDirectusUsers as DocumentSubscriber,
	DocumentsTags as DocumentTag,
	Tags as Tag,
} from '@/types/directus'

//* INITIALIZE SEARCH STATE
const route = useRoute()
const search = $ref<string>((route.query.search as string) || '')
// Make sure the url tags are always parsed as an array of numbers (ids)
const tags = $ref<number[]>(
	route.query.tags?.length ? parseArray<number>(route.query.tags as string | string[]) : []
)
const allTags = await readAll<Tag>('tags')
const allUsers = await readAllUsers()

//* DOCUMENT SELECTION
const { selected: selectedDocs, select: selectDoc } = useSelection<Document>()

//* SEARCH
let documents = $ref<Document[]>([])
await executeSearch()

async function executeSearch() {
	// When a search is executed, reflect it in the URL
	const router = useRouter()
	router.replace({ query: formatUrlQuery() })

	// Reset selections on search
	selectedDocs.value = []

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
			'subscribers.directus_users_id.id',
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
const SEARCH_DEBOUNCE_MS = 300 // How long to wait after typing in search bar before sending request
watchDebounced($$(search), executeSearch, {
	debounce: SEARCH_DEBOUNCE_MS,
	maxWait: 2000,
})

// Execute search when tags change
watch($$(tags), executeSearch)

//* MODAL
let documentModalShown = $ref<boolean>(false)
let creatingDocument = $ref<boolean>(false) // toggled on when modal needs input for document title
let editingTags = $ref<boolean>(false) // toggled on when modal needs input for document tags
let editingSubs = $ref<boolean>(false) // toggled on when modal needs input for document subscribers

function hideModal() {
	documentModalShown = false
}

//* EDIT TAGS
let editTagsValue = $ref<Number[]>([])

function showTagsModal() {
	// tags is a junction type that has a tags_id field which is populated as the actual tag
	editTagsValue = (selectedDocs.value[0].tags as DocumentTag[]).map(tag => (tag.tags_id as Tag).id)

	documentModalShown = true
	creatingDocument = false
	editingTags = true
	editingSubs = false
}

// Returns whether the the array of tags (to update doc with) has the same elements as the current doc's tags or not, so we can disable submit btn
const editTagsValueChanged = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return false
	const sameLength = editTagsValue.length === selectedDoc.tags.length
	if (!sameLength) return true // If the length is different, the arrays are different

	// If the length is the same, every tag in the input must exist in the selected doc's tags for the arrays to be the same, so we return the inverse
	return !editTagsValue.every(tag => {
		return (selectedDoc.tags as DocumentTag[]).some(
			currentTag => (currentTag.tags_id as Tag).id === tag
		)
	})
})

async function updateSelectedDocumentTags() {
	const doc = selectedDocs.value[0]

	try {
		const updates: Pick<Document, 'tags'> = {
			tags: editTagsValue.map(tag => ({
				tags_id: tag,
			})) as DocumentTag[],
		}

		await updateDocument(doc.id, updates)

		// Refresh list of docs with new update
		executeSearch()

		hideModal()
	} catch (err) {
		alert(`There was an error updating the document '${doc.title}'`)
		console.error(err)
	}
}

//* EDIT SUBSCRIBERS
let editSubsValue = $ref<DirectusUser[]>([])

function showSubsModal() {
	// subscribers is a junction type that has a directus_users_id field which is populated as the actual user
	editSubsValue = (selectedDocs.value[0].subscribers as DocumentSubscriber[]).map(
		sub => sub.directus_users_id as DirectusUser
	)

	documentModalShown = true
	creatingDocument = false
	editingTags = false
	editingSubs = true
}

// Returns whether the the array of subs (to update doc with) has the same elements as the current doc's subs or not, so we can disable submit btn
const editSubsValueChanged = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return false

	const sameLength = editSubsValue.length === selectedDoc.subscribers.length
	if (!sameLength) return true // If the length is different, the arrays are different

	// If the length is the same, every user in the input must exist in the selected doc's subs for the arrays to be the same, so we return the inverse
	return !editSubsValue.every(user => {
		return (selectedDoc.subscribers as DocumentSubscriber[]).some(
			currentSub => (currentSub.directus_users_id as DirectusUser).id === user.id
		)
	})
})

async function updateSelectedDocumentSubs() {
	const doc = selectedDocs.value[0]

	try {
		const updates: Pick<Document, 'subscribers'> = {
			subscribers: editSubsValue.map(user => ({
				directus_users_id: user.id,
			})) as DocumentSubscriber[],
		}

		await updateDocument(doc.id, updates)

		// Refresh list of docs with new update
		executeSearch()

		hideModal()
	} catch (err) {
		alert(`There was an error updating the document '${doc.title}'`)
		console.error(err)
	}
}

//* CREATE DOCUMENT
let editTitleValue = $ref<string>('')

function showCreateModal() {
	editTitleValue = ''
	editTagsValue = []
	editSubsValue = []

	documentModalShown = true
	creatingDocument = true
	editingTags = true
	editingSubs = true
}

async function newDocument() {
	try {
		const newDoc: Partial<Document> = {
			title: editTitleValue,
			tags: editTagsValue.map(tag => ({ tags_id: tag.id })) as DocumentTag[],
			subscribers: editSubsValue.map(user => ({
				directus_users_id: user.id,
			})) as DocumentSubscriber[],
		}

		const createdDoc = await createDocument(newDoc)

		hideModal()

		if (createdDoc?.id) return navigateTo('/documents/' + createdDoc.id)
	} catch (err) {
		alert('There was an error creating document')
		console.error(err)
	}
}

//* DELETE DOCUMENTS
async function deleteSelectedDocuments() {
	if (!selectedDocs.value.length) return

	// TODO: block deletion if anyone is editing the document atm, since we can assume they won't want it deleted

	const msg =
		selectedDocs.value.length > 1
			? `Are you sure you want to delete multiple documents?`
			: `Are you sure you want to delete the document '${selectedDocs.value[0].title}'?`
	if (!window.confirm(msg)) {
		return
	}

	try {
		await deleteMany(
			'documents',
			selectedDocs.value.map(doc => doc.id)
		)
	} catch (err) {
		alert(`There was an error deleting documents`)
		console.error(err)
	}

	// Refresh documents
	executeSearch()
}
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
