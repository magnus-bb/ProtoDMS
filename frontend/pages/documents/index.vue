<template>
	<Teleport to="#sidebar-content">
		<h2 class="text-center text-2xl font-semibold">Actions</h2>

		<ul ref="actions" tabindex="0" class="menu p-2 rounded-box">
			<li class="menu-title">
				<span>Quick actions</span>
			</li>
			<!-- create document -->
			<li class="text-2xl" title="New document">
				<button @click="showCreateModal">
					<Icon class="weight-700 fill optical-size-40 text-success">note_add</Icon>
					<span class="text-base">New document <kbd class="kbd kbd-sm">insert</kbd></span>
				</button>
			</li>
			<!-- edit document-->
			<li class="text-2xl" :class="{ disabled: selectedDocs.length !== 1 }" title="Edit document">
				<NuxtLink
					v-if="selectedDocs.length === 1"
					target="_blank"
					:to="`/documents/${selectedDocs[0]?.id}`"
				>
					<Icon class="weight-700 fill optical-size-40 text-info">edit_document</Icon>
					<span class="text-base">Edit document <kbd class="kbd kbd-sm">↵</kbd></span>
				</NuxtLink>
				<span v-else>
					<Icon class="weight-700 fill optical-size-40 text-info">edit_document</Icon>
					<span class="text-base">Edit document <kbd class="kbd kbd-sm">↵</kbd></span>
				</span>
			</li>
			<!-- delete documents -->
			<li class="text-2xl" :class="{ disabled: !selectedDocs.length }" title="Delete selection">
				<button :disabled="!selectedDocs.length" @click="deleteSelectedDocuments">
					<Icon class="weight-700 fill optical-size-40 text-error">delete</Icon>
					<span class="text-base">Delete selection <kbd class="kbd kbd-sm">delete</kbd></span>
				</button>
			</li>
			<li class="menu-title">
				<span>Relations</span>
			</li>
			<!-- edit related docs -->
			<li
				:class="{ disabled: selectedDocs.length !== 1 }"
				class="text-2xl"
				title="Set related documents"
			>
				<button :disabled="selectedDocs.length !== 1" @click="showRelatedDocsModal">
					<Icon class="weight-700 fill optical-size-40">file_open</Icon>
					<span class="text-base">Set related documents</span>
				</button>
			</li>
			<!-- edit tags -->
			<li :class="{ disabled: selectedDocs.length !== 1 }" class="text-2xl" title="Set tags">
				<button :disabled="selectedDocs.length !== 1" @click="showTagsModal">
					<Icon class="weight-700 fill optical-size-40">sell</Icon>
					<span class="text-base">Set tags</span>
				</button>
			</li>
			<!-- edit subscribers -->
			<li
				:class="{ disabled: selectedDocs.length !== 1 }"
				class="text-2xl"
				title="Set related users"
			>
				<button :disabled="selectedDocs.length !== 1" @click="showUsersModal">
					<Icon class="weight-700 fill optical-size-40">group</Icon>
					<span class="text-base">Set related users</span>
				</button>
			</li>
			<!-- edit related files -->
			<li
				:class="{ disabled: selectedDocs.length !== 1 }"
				class="text-2xl"
				title="Set related files"
			>
				<button :disabled="selectedDocs.length !== 1" @click="showRelatedFilesModal">
					<Icon class="weight-700 fill optical-size-40">attach_file</Icon>
					<span class="text-base">Set related files</span>
				</button>
			</li>
			<li class="menu-title">
				<span>Manage</span>
			</li>
			<!-- duplicate document -->
			<li
				:class="{ disabled: selectedDocs.length !== 1 }"
				class="text-2xl"
				title="Duplicate document"
			>
				<button :disabled="selectedDocs.length !== 1" @click="duplicateDocument">
					<Icon class="weight-700 fill optical-size-40">file_copy</Icon>
					<span class="text-base">Duplicate document</span>
				</button>
			</li>
			<!-- make private / publish -->
			<li
				class="text-2xl"
				:class="{ disabled: selectedDocs.length !== 1 || !isOwnerOfSelectedDoc }"
				:title="selectedDocIsPrivate ? 'Make public' : 'Make private'"
			>
				<button
					:disabled="selectedDocs.length !== 1 || !isOwnerOfSelectedDoc"
					@click="togglePrivate"
				>
					<Icon v-if="selectedDocIsPrivate" class="weight-700 fill optical-size-40">lock_open</Icon>
					<Icon v-else class="weight-700 fill optical-size-40">lock</Icon>
					<span v-if="selectedDocIsPrivate" class="text-base">Make public</span>
					<span v-else class="text-base">Make public</span>
				</button>
			</li>
		</ul>
	</Teleport>

	<div class="p-4 flex flex-col">
		<div class="grid gap-x-4 gap-y-2 items-center grid-cols-2">
			<div class="text-4xl font-semibold">
				{{ privatePage ? 'Your private documents' : 'Public documents' }}
			</div>

			<div class="justify-self-end hidden lg:block">
				<kbd class="kbd kbd-sm">ctrl</kbd>
				+
				<kbd class="kbd kbd-sm">click</kbd>
				to select multiple documents
			</div>

			<!-- SELECTED DOCUMENT ACTIONS -->
			<div class="justify-self-end flex gap-x-2 lg:hidden">
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
								<Icon class="weight-700 fill optical-size-40 text-success">note_add</Icon>
							</button>
						</li>
						<!-- duplicate document -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Duplicate document"
						>
							<button @click="duplicateDocument">
								<Icon class="weight-700 fill optical-size-40">file_copy</Icon>
							</button>
						</li>
						<!-- make private / publish -->
						<li
							v-if="selectedDocs.length === 1 && isOwnerOfSelectedDoc"
							class="items-center text-xl sm:text-2xl"
							:title="selectedDocIsPrivate ? 'Make public' : 'Make private'"
						>
							<button @click="togglePrivate">
								<Icon v-if="selectedDocIsPrivate" class="weight-700 fill optical-size-40"
									>lock_open</Icon
								>
								<Icon v-else class="weight-700 fill optical-size-40">lock</Icon>
							</button>
						</li>
						<!-- edit document-->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Edit document"
						>
							<NuxtLink target="_blank" :to="`/documents/${selectedDocs[0].id}`">
								<Icon class="weight-700 fill optical-size-40 text-info">edit_document</Icon>
							</NuxtLink>
						</li>
						<!-- edit related docs -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Set related documents"
						>
							<button @click="showRelatedDocsModal">
								<Icon class="weight-700 fill optical-size-40">file_open</Icon>
							</button>
						</li>
						<!-- edit tags -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Set tags"
						>
							<button @click="showTagsModal">
								<Icon class="weight-700 fill optical-size-40">sell</Icon>
							</button>
						</li>
						<!-- edit subscribers -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Set related users"
						>
							<button @click="showUsersModal">
								<Icon class="weight-700 fill optical-size-40">group</Icon>
							</button>
						</li>
						<!-- edit related files -->
						<li
							v-if="selectedDocs.length === 1"
							class="items-center text-xl sm:text-2xl"
							title="Set related files"
						>
							<button @click="showRelatedFilesModal">
								<Icon class="weight-700 fill optical-size-40">attach_file</Icon>
							</button>
						</li>
						<!-- delete documents -->
						<li
							v-if="selectedDocs.length"
							class="items-center text-xl sm:text-2xl"
							title="Delete selection"
						>
							<button @click="deleteSelectedDocuments">
								<Icon class="weight-700 fill optical-size-40 text-error">delete</Icon>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="divider" />

		<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
			<!-- SEARCH -->
			<div class="form-control">
				<label for="search" class="sr-only">Simply start typing to search documents</label>
				<div class="input-group">
					<input
						id="search"
						ref="searchInput"
						v-model="search"
						type="search"
						name="search"
						aria-label="Search input"
						class="input input-bordered placeholder:text-muted w-full"
						placeholder="Simply start typing to search documents"
					/>
					<Icon class="text-2xl optical-size-40 grade-100">search</Icon>
				</div>
			</div>

			<!-- TAGS -->
			<div class="flex items-center gap-4">
				<FilterSelect
					v-model="tags"
					name="tags"
					:options="allTags"
					multiple
					label-prop="name"
					emit-prop="id"
					class="border-0 bg-base-300"
				>
					Tags
				</FilterSelect>
				<button class="btn btn-outline btn-secondary" @click="showAddRemoveTagsModal">
					Add/remove tags
				</button>
			</div>
		</div>

		<main class="space-y-8">
			<div v-if="documents?.length" ref="documentGrid" class="document-grid">
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

	<!-- CREATE DOCUMENT / EDIT TAGS & SUBS MODAL -->
	<Modal :class="{ 'modal-open': documentModalShown }" @hide="hideDocumentModal">
		<template #heading>
			<h3 v-if="creatingDocument" class="text-lg font-bold mb-4">Create document</h3>
			<h3 v-else-if="editingTags" class="text-lg font-bold mb-4">Select tags</h3>
			<h3 v-else-if="editingUsers" class="text-lg font-bold mb-4">Select users</h3>
		</template>

		<div class="grid gap-y-4">
			<div v-if="creatingDocument" class="form-control">
				<label for="title" class="label pt-0"><span class="label-text">Title</span></label>
				<input
					id="title"
					v-model="editTitleValue"
					placeholder="Document title"
					class="input input-bordered placeholder:text-muted"
				/>
			</div>
			<div v-if="creatingDocument" class="form-control">
				<label for="private" class="label pt-0">
					<span class="label-text">Private document</span>
				</label>
				<input
					id="private"
					v-model="editPrivateValue"
					type="checkbox"
					class="toggle toggle-primary"
				/>
			</div>
			<div v-if="editingTags">
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
			<div v-if="editingUsers" class="space-y-4">
				<UserSelector v-model="editUsersValue" :options="allUsers" class="flex flex-col gap-y-2">
					Users
				</UserSelector>
				<UserSelector v-model="editSubsValue" :options="allUsers" class="flex flex-col gap-y-2">
					Subscribers
				</UserSelector>
			</div>
		</div>
		<template #actions>
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
				v-else-if="editingUsers"
				class="btn btn-block btn-accent gap-x-2"
				:disabled="!editSubsValueChanged && !editUsersValueChanged"
				@click="updateSelectedDocumentUsers"
			>
				<Icon class="weight-700 fill optical-size-40 text-lg">group_add</Icon>
				<span>Set users</span>
			</button>
		</template>
	</Modal>

	<!-- CREATE / DELETE TAGS MODAL -->
	<Modal :class="{ 'modal-open': addRemoveTagsModalShown }" @hide="hideAddRemoveTagsModal">
		<template #heading>Add/remove tags</template>

		<div class="form-control w-full">
			<label class="label" for="new-tag-input">
				<span class="label-text">Create tag</span>
			</label>
			<div class="flex gap-x-4">
				<input
					id="new-tag-input"
					v-model="newTagInputValue"
					placeholder="Tag name"
					class="input input-bordered w-full placeholder:text-muted mb-4"
				/>
				<button class="btn btn-accent gap-x-2" :disabled="!newTagNameValid" @click="newTag">
					Add<Icon class="fill optical-size-40">sell</Icon>
				</button>
			</div>
		</div>

		<div class="form-control w-full">
			<label class="label" for="filter-tags">
				<span class="label-text">Delete tags</span>
			</label>
			<input
				id="filter-tags"
				v-model="tagFilterString"
				placeholder="Filter tags"
				class="input input-bordered w-full placeholder:text-muted mb-4"
			/>
		</div>

		<div class="flex flex-wrap gap-2">
			<span
				v-for="tag of filteredTags"
				:key="tag.id"
				class="badge badge-lg badge-outline badge-secondary gap-x-2"
			>
				<button class="flex items-center text-sm" @click="removeTag(tag)">
					<Icon class="fill optical-size-24 grade-100 text-error" aria-hidden>close</Icon>
				</button>
				{{ tag.name }}
			</span>
		</div>
	</Modal>

	<!-- RELATED DOCS MODAL -->
	<DocumentSelector
		v-if="relatedDocsModalShown"
		:class="{ 'modal-open': relatedDocsModalShown }"
		:current-document="selectedDocs[0]"
		@hide="hideRelatedDocsModal"
		@update-relations="updateRelatedDocs"
	/>

	<!-- RELATED FILES MODAL -->
	<Modal :class="{ 'modal-open': relatedFilesModalShown }" @hide="hideRelatedFilesModal">
		<template #heading>Remove related files</template>

		<div v-if="alreadyRelatedFiles.length" class="flex flex-wrap gap-2 mt-2">
			<button
				v-for="file of alreadyRelatedFiles"
				:key="file.id"
				class="badge badge-lg badge-base-200 font-mono cursor-pointer items-center gap-1.5"
				@click="removeRelatedFile(file.id)"
			>
				<Icon class="fill optical-size-24 grade-100 text-sm" aria-hidden>close</Icon>
				<span>
					{{ file.filename_download }}
				</span>
			</button>
		</div>

		<p v-else class="font-light italic">No related files</p>

		<h3 class="text-lg font-bold mb-4 mt-6">Add related files</h3>
		<ul>
			<Folder :folder="rootFolder" :highlight-folder="currentFolder" @select="goToFolder" />
		</ul>

		<div class="divider" />

		<!-- TODO render files with previews if it is easy to reuse, otherwise just use a list of names -->
		<div class="file-grid">
			<File
				v-for="file of currentFolderFiles"
				:key="file.id"
				:file="file"
				@click="addRelatedFile(file.id)"
			/>
		</div>
	</Modal>
</template>

<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import autoAnimate from '@formkit/auto-animate'
import type {
	Documents as Document,
	DirectusUsers as DirectusUser,
	DocumentsDirectusUsers as DocumentSubscriber,
	DocumentsRelatedUsers as RelatedUser,
	DocumentsTags as DocumentTag,
	DocumentsRelatedFiles as RelatedFile,
	DirectusFiles as File,
	DirectusFolders as DirectusFolder,
	Tags as Tag,
	DocumentsRelatedDocuments as RelatedDocument,
} from '@/types/directus'
import type { TreeFolder } from '@/types/files'
import { getAllFiles } from '~~/utils/files'

definePageMeta({
	layout: 'sidebar',
})

//* PAGE VERSION
const route = useRoute()
const routeName = route.name as 'home' | 'documents' // lets us know whether we are on the private or public page

// Are we on the signin version of the page?
const privatePage = $computed<boolean>(() => routeName === 'home')

//* INITIALIZE SEARCH STATE
const search = $ref<string>((route.query.search as string) || '')
// Make sure the url tags are always parsed as an array of numbers (ids)
const tags = $ref<number[]>(
	route.query.tags?.length ? parseArray<number>(route.query.tags as string | string[]) : []
)
let allTags = $ref<Tag[]>([])
await refreshTags()
async function refreshTags() {
	allTags = await readAll<Tag>('tags')
}
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

	// Only add filters if they are used
	const filter: { private?: boolean; tags?: { tags_id: any } } = {}
	if (privatePage) {
		filter.private = true
	}
	if (tags.length) {
		filter.tags = {
			tags_id: {
				_in: tags,
			},
		}
	}

	const res = await query<Document>('documents', {
		search,
		filter,
		fields: [
			'*',
			'related_documents.id',
			'related_documents.document_id.*',
			'related_documents.related_document_id.*',
			'related_documents.related_document_id.tags.tags_id.*',
			'subscribers.directus_users_id.id',
			'subscribers.directus_users_id.avatar',
			'subscribers.directus_users_id.first_name',
			'subscribers.directus_users_id.last_name',
			'related_users.user_id.id',
			'related_users.user_id.avatar',
			'related_users.user_id.first_name',
			'related_users.user_id.last_name',
			'related_files.id',
			'related_files.file_id.*',
			'tags.id',
			'tags.tags_id.*',
		],
		sort: ['-private', 'title', 'tags'],
		limit: -1,
	})

	documents = res
}

// Animate on search
const documentGrid = ref<HTMLElement>()
// const actions = ref<HTMLElement>()
onMounted(() => {
	// The element does not exist, if there are no docs to render
	if (documents?.length) {
		autoAnimate(documentGrid.value as HTMLElement)
	}
})
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

//* DOCUMENT MODAL
let documentModalShown = $ref<boolean>(false)
let creatingDocument = $ref<boolean>(false) // toggled on when modal needs input for document title
let editingTags = $ref<boolean>(false) // toggled on when modal needs input for document tags
let editingUsers = $ref<boolean>(false) // toggled on when modal needs input for document subscribers

function hideDocumentModal() {
	documentModalShown = false
}

//* EDIT DOCUMENT TAGS
let editTagsValue = $ref<Number[]>([])

function showTagsModal() {
	// tags is a junction type that has a tags_id field which is populated as the actual tag
	editTagsValue = (selectedDocs.value[0].tags as DocumentTag[]).map(tag => (tag.tags_id as Tag).id)

	documentModalShown = true
	creatingDocument = false
	editingTags = true
	editingUsers = false
}

// Returns whether the the array of tags (to update doc with) has the same elements as the current doc's tags or not, so we can disable submit btn
const editTagsValueChanged = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return false
	const sameLength = editTagsValue.length === selectedDoc.tags?.length
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

		hideDocumentModal()
	} catch (err) {
		alert(`There was an error updating the document '${doc.title}'`)
		console.error(err)
	}
}

//* EDIT SUBSCRIBERS AND RELATED USERS
let editUsersValue = $ref<DirectusUser[]>([])
let editSubsValue = $ref<DirectusUser[]>([])

function showUsersModal() {
	// related_users is a junction type that has a user_id field which is populated as the actual user
	editUsersValue = (selectedDocs.value[0].related_users as RelatedUser[]).map(
		rel => rel.user_id as DirectusUser
	)
	// subscribers is a junction type that has a directus_users_id field which is populated as the actual user
	editSubsValue = (selectedDocs.value[0].subscribers as DocumentSubscriber[]).map(
		sub => sub.directus_users_id as DirectusUser
	)

	documentModalShown = true
	creatingDocument = false
	editingTags = false
	editingUsers = true
}

// Returns whether the the array of related users (to update doc with) has the same elements as the current doc's users or not, so we can disable submit btn
const editUsersValueChanged = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return false

	const sameLength = editUsersValue.length === selectedDoc.related_users?.length
	if (!sameLength) return true // If the length is different, the arrays are different

	// If the length is the same, every user in the input must exist in the selected doc's subs for the arrays to be the same, so we return the inverse
	return !editUsersValue.every(user => {
		return (selectedDoc.related_users as RelatedUser[]).some(
			currentUser => (currentUser.user_id as DirectusUser).id === user.id
		)
	})
})

// Returns whether the the array of subs (to update doc with) has the same elements as the current doc's subs or not, so we can disable submit btn
const editSubsValueChanged = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return false

	const sameLength = editSubsValue.length === selectedDoc.subscribers?.length
	if (!sameLength) return true // If the length is different, the arrays are different

	// If the length is the same, every user in the input must exist in the selected doc's subs for the arrays to be the same, so we return the inverse
	return !editSubsValue.every(user => {
		return (selectedDoc.subscribers as DocumentSubscriber[]).some(
			currentSub => (currentSub.directus_users_id as DirectusUser).id === user.id
		)
	})
})

async function updateSelectedDocumentUsers() {
	const doc = selectedDocs.value[0]

	try {
		const updates: Pick<Document, 'subscribers' | 'related_users'> = {
			subscribers: editSubsValue.map(user => ({
				directus_users_id: user.id,
			})) as DocumentSubscriber[],
			related_users: editUsersValue.map(user => ({
				user_id: user.id,
			})) as RelatedUser[],
		}

		await updateDocument(doc.id, updates)

		// Refresh list of docs with new update
		executeSearch()

		hideDocumentModal()
	} catch (err) {
		alert(`There was an error updating the document '${doc.title}'`)
		console.error(err)
	}
}

//* CREATE DOCUMENT
let editTitleValue = $ref<string>('')
let editPrivateValue = $ref<boolean>(true)

function showCreateModal() {
	editTitleValue = ''
	editPrivateValue = true
	editTagsValue = []
	editUsersValue = []
	editSubsValue = []

	documentModalShown = true
	creatingDocument = true
	editingTags = false
	editingUsers = false
}

async function newDocument() {
	try {
		const newDoc: Partial<Document> = {
			title: editTitleValue,
			private: editPrivateValue,
		}

		const createdDoc = await createDocument(newDoc)

		hideDocumentModal()

		if (createdDoc?.id) return window.open('/documents/' + createdDoc.id, '_blank')
	} catch (err) {
		alert('There was an error creating document')
		console.error(err)
	}
}

onKeyStroke('Insert', () => {
	showCreateModal()
})

//* DUPLICATE DOCUMENT
async function duplicateDocument() {
	const selected = selectedDocs.value[0]

	const selectedSubIds = (selected.subscribers as DocumentSubscriber[]).map(
		({ directus_users_id }) => {
			return {
				directus_users_id: (directus_users_id as DirectusUser)?.id,
			}
		}
	)
	const selectedRelUserIds = (selected.related_users as RelatedUser[]).map(({ user_id }) => {
		return {
			user_id: (user_id as DirectusUser)?.id,
		}
	})
	const selectedTagIds = (selected.tags as DocumentTag[]).map(({ tags_id }) => {
		return {
			tags_id: (tags_id as Tag)?.id,
		}
	})
	const selectedRelDocIds = (selected.related_documents as RelatedDocument[]).map(
		({ related_document_id }) => {
			return {
				related_document_id: (related_document_id as Document)?.id,
			}
		}
	)
	const selectedRelFileIds = (selected.related_files as RelatedFile[]).map(({ file_id }) => {
		return {
			file_id: (file_id as File)?.id,
		}
	})

	const duplicatedDocument = {
		title: `Copy of ${selected.title}`,
		content: selected.content,
		tags: selectedTagIds,
		subscribers: selectedSubIds,
		related_users: selectedRelUserIds,
		related_documents: selectedRelDocIds,
		related_files: selectedRelFileIds,
	}

	await createDocument(duplicatedDocument as any)

	executeSearch()
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

onKeyStroke('Delete', () => {
	deleteSelectedDocuments()
})

//* ADD / REMOVE TAGS
async function removeTag(tag: Tag) {
	if (!window.confirm(`Are you sure you want to delete the tag '${tag.name}'?`)) {
		return
	}

	try {
		await deleteTag(tag.id)

		refreshTags()
		executeSearch()
	} catch (err) {
		alert(`There was an error deleting the tag '${tag.name}'`)
		console.error(err)
	}

	refreshTags()
}

let newTagInputValue = $ref<string>('')

async function newTag() {
	try {
		await createTag(newTagInputValue)

		newTagInputValue = ''

		refreshTags()
	} catch (err) {
		alert(`There was an error creating tag`)
		console.error(err)
	}
}

const newTagNameValid = $computed<boolean>(() => {
	const lowercaseInput = newTagInputValue.toLowerCase()

	if (allTags.map(tag => (tag.name as string).toLowerCase()).includes(lowercaseInput)) {
		return false
	}

	return newTagInputValue.length > 0
})

let tagFilterString = $ref<string>('')

const filteredTags = $computed<Tag[]>(() => {
	return allTags.filter(tag => {
		return (tag.name as string).toLowerCase().includes(tagFilterString.toLowerCase())
	})
})

let addRemoveTagsModalShown = $ref<boolean>(false)

function showAddRemoveTagsModal() {
	addRemoveTagsModalShown = true

	newTagInputValue = ''
	tagFilterString = ''
}

function hideAddRemoveTagsModal() {
	addRemoveTagsModalShown = false
}

//* EDIT RELATED DOCUMENTS
let relatedDocsModalShown = $ref<boolean>(false)
function showRelatedDocsModal() {
	relatedDocsModalShown = true
}
function hideRelatedDocsModal() {
	relatedDocsModalShown = false
}

async function updateRelatedDocs(idToUpdate: number, newDocIds: number[]) {
	try {
		const updates: Pick<Document, 'related_documents'> = {
			related_documents: newDocIds.map(docId => ({
				related_document_id: docId,
			})) as RelatedDocument[],
		}

		await updateDocument(idToUpdate, updates)
	} catch (err) {
		alert(
			`There was an error updating the document '${selectedDocs.value[0].title}'s related documents`
		)
		console.error(err)
	}

	hideRelatedDocsModal()

	executeSearch()
}

//* OPEN SELECTED DOCUMENT
onKeyStroke('Enter', (e: KeyboardEvent) => {
	e.preventDefault()

	if (selectedDocs.value.length === 1) {
		window.open('/documents/' + selectedDocs.value[0].id, '_blank')
	}
})
//* EDIT RELATED FILES
let relatedFilesModalShown = $ref<boolean>(false)

async function showRelatedFilesModal() {
	await Promise.all([refreshFolders(), refreshAllFiles()])
	relatedFilesModalShown = true
}

function hideRelatedFilesModal() {
	relatedFilesModalShown = false
}

// FOLDER RENDERING
let allFolders: DirectusFolder[] = $ref([])
await refreshFolders()

async function refreshFolders() {
	allFolders = await getAllFolders()
}
const rootFolder = $computed<TreeFolder>(() => createDirectoryTree(allFolders))

let currentFolder = $ref<TreeFolder>(rootFolder)
function goToFolder(folder: TreeFolder) {
	currentFolder = folder
}

// FILE RENDERING
let allFiles = $ref<File[]>([])
refreshAllFiles()
async function refreshAllFiles() {
	allFiles = await getAllFiles()
}

const alreadyRelatedFiles = $computed<File[]>(() => {
	const selectedDoc = selectedDocs.value[0]
	if (!selectedDoc) return []

	return (selectedDoc.related_files as RelatedFile[]).map(rel => rel.file_id as File)
})

const alreadyRelatedFileIds = $computed<string[]>(() =>
	alreadyRelatedFiles.map((file: File) => file.id)
)

// Files in currentFolder that are not already related to selected doc
const currentFolderFiles = $computed<File[]>(() => {
	const selectedDoc = selectedDocs.value[0]
	if (!selectedDoc) return []

	return allFiles.filter((file: File) => {
		return file.folder === currentFolder.id && !alreadyRelatedFileIds.includes(file.id)
	})
})

// UPDATING
async function addRelatedFile(idToAdd: string) {
	const newIds = [...alreadyRelatedFileIds, idToAdd]

	await updateRelatedFiles(newIds)
}

async function removeRelatedFile(idToRemove: string) {
	const newIds = alreadyRelatedFileIds.filter(id => id !== idToRemove)

	await updateRelatedFiles(newIds)
}

async function updateRelatedFiles(newFileIds: string[]) {
	const doc = selectedDocs.value[0]

	try {
		const updates = {
			related_files: newFileIds.map(fileId => ({
				file_id: fileId,
			})) as RelatedFile[],
		}

		await updateDocument(doc.id, updates)
	} catch (err) {
		alert(
			`There was an error updating the document '${selectedDocs.value[0].title}'s related files`
		)
		console.error(err)
	}

	hideRelatedFilesModal()

	await executeSearch()
}

//* TOGGLE PRIVATE/PUBLIC
const { user } = useUser()

const isOwnerOfSelectedDoc = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	return selectedDoc?.user_created === user.value?.id
})
const selectedDocIsPrivate = $computed<boolean>(() => {
	const selectedDoc = selectedDocs.value[0]

	return selectedDoc?.private
})

async function togglePrivate() {
	if (!isOwnerOfSelectedDoc) return

	const selectedDoc = selectedDocs.value[0]

	if (!selectedDoc) return

	try {
		await updateDocument(selectedDoc.id, {
			private: !selectedDoc.private,
		})
	} catch (err) {
		alert(
			`There was an error making the document '${selectedDoc.title} ${
				selectedDocIsPrivate ? 'public' : 'private'
			}`
		)
	}

	await executeSearch()
}
</script>

<style scoped lang="postcss">
.document-grid {
	@apply grid gap-6;

	grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

.file-grid {
	@apply grid gap-6;

	--file-width: 80px;
	@screen sm {
		--file-width: 112px;
	}

	grid-template-columns: repeat(auto-fill, minmax(var(--file-width), 1fr));
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

button[disabled] {
	@apply cursor-default pointer-events-none;
}
</style>
