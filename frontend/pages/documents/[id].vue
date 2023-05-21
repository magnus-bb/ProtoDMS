<template>
	<div class="row p-4 flex flex-col gap-y-4">
		<header class="flex justify-between items-center gap-x-4">
			<!-- document title -->
			<InputToggle>
				<label for="renameFolder" class="sr-only">Rename document</label>
				<input
					id="renameDocument"
					ref="renameDocumentInput"
					v-model="renameDocumentInputValue"
					class="input w-full max-w-lg placeholder:text-muted text-3xl"
					placeholder="Document title"
				/>

				<template #display>
					<button
						title="Rename document"
						class="flex items-center gap-4 px-0 text-2xl sm:text-3xl font-semibold tracking-wide h-12"
					>
						<h1>{{ renameDocumentInputValue }}</h1>
						<Icon class="grade-200 weight-700 fill optical-size-40">drive_file_rename_outline</Icon>
					</button>
				</template>
			</InputToggle>

			<!-- users in document -->
			<div class="tooltip tooltip-left" :data-tip="editingUsersString">
				<div class="avatar-group -space-x-3 cursor-default">
					<Avatar
						v-for="editingUser of editingUsers"
						:key="editingUser.id"
						:user="editingUser"
						:avatar-options="{ key: 'user-avatar' }"
						class="w-8 text-sm"
						avatar-class="border-2 border-secondary"
					/>
				</div>
			</div>
		</header>

		<!-- document editor -->
		<main class="shadow-xl rounded-daisy-box p-8 quill-section" data-theme="winter">
			<QuillEditorToolbar id="editor-toolbar" />
			<!-- handlers: {
						'directus-select-or-upload-file': selectOrUploadFile,
					}, -->
			<QuillEditor
				:toolbar="{
					container: '#editor-toolbar',
				}"
				class="!border-none"
				theme="snow"
				:enable="online"
				:modules="quillModules"
				@ready="editorReady"
			/>
		</main>

		<!-- save document button and save message -->
		<div class="flex gap-x-2 items-center my-2">
			<button
				class="btn btn-accent gap-2"
				:disabled="!documentChangeSinceSave"
				@click="saveDocument"
			>
				<Icon class="fill text-3xl">save</Icon>Save document
			</button>
			<span class="text-muted text-sm">{{ relativeDocumentSaveTimeString }}</span>
		</div>

		<h2 class="text-xl sm:text-2xl font-semibold">Attached diagram</h2>
		<DiagramEditor
			class="w-full h-[50vh] rounded-daisy-box overflow-hidden"
			:relative-save-time-string="relativeDiagramSaveTimeString"
			:editor-content="diagramContent"
			@save="saveDiagram"
		/>

		<Teleport to="#sidebar-content" :disabled="noSidebar">
			<h2 class="text-2xl font-semibold lg:text-center">Related items</h2>
			<div class="lg:px-3">
				<h2 class="text-lg font-semibold">Documents</h2>
				<div v-if="relatedDocuments.length" class="flex flex-wrap gap-2 mt-2">
					<NuxtLink
						v-for="relDoc of relatedDocuments"
						:key="relDoc.id"
						class="badge badge-lg badge-base-200"
						target="_blank"
						:to="`/documents/${relDoc.id}`"
					>
						{{ relDoc.title }}
					</NuxtLink>
				</div>
				<p v-else class="font-light italic">No related documents</p>
			</div>

			<div class="lg:px-3">
				<h2 class="text-lg font-semibold">Users</h2>
				<div v-if="initialDocument?.related_users?.length" class="flex flex-wrap gap-2 mt-2">
					<NuxtLink
						v-for="rel of initialDocument!.related_users"
						:key="(rel as RelatedUser).id"
						class="badge badge-lg badge-base-200"
						target="_blank"
						:to="`/users/${((rel as RelatedUser).user_id as DirectusUser).id}`"
					>
						{{
							[
								((rel as RelatedUser).user_id as DirectusUser).first_name,
								((rel as RelatedUser).user_id as DirectusUser).last_name,
							]
								.filter(u => u)
								.join(' ')
						}}
					</NuxtLink>
				</div>
				<p v-else class="font-light italic">No related users</p>
			</div>

			<div class="lg:px-3">
				<h2 class="text-lg font-semibold">Files</h2>
				<div v-if="initialDocument?.related_files?.length" class="flex flex-wrap gap-2 mt-2">
					<NuxtLink
						v-for="rel of initialDocument!.related_files"
						:key="(rel as RelatedFile).id"
						class="badge badge-lg badge-base-200"
						target="_blank"
						:download="((rel as RelatedFile).file_id as File).filename_download"
						:to="getAssetUrl(((rel as RelatedFile).file_id as File).id, { download: true })"
					>
						{{ ((rel as RelatedFile).file_id as File).filename_download }}
					</NuxtLink>
				</div>
				<p v-else class="font-light italic">No related files</p>
			</div>

			<h2 class="mt-4 text-2xl font-semibold lg:text-center">Revisions</h2>
			<div class="lg:px-3">
				<ul
					v-if="documentRevisions.length"
					class="menu menu-compact bg-base-200 lg:bg-base-100 rounded-box"
				>
					<!-- revisions are by default returned from oldest to newest, but we want the latest at the top, so we reverse -->
					<li v-for="rev of [...documentRevisions].reverse()" :key="rev.id">
						<button class="flex" @click="showActiveRevisionModal(rev)">
							<Avatar
								:user="((rev.activity as Activity).user as DirectusUser)"
								avatar-class="w-8 text-sm border-2 border-secondary rounded-full overflow-hidden"
								:avatar-options="{ key: 'user-avatar' }"
							/>
							<div class="flex flex-col items-start">
								<span class="text-sm">{{
									getFullName((rev.activity as Activity).user as DirectusUser)
								}}</span>
								<span class="text-xs text-muted">{{
									dateStringFromTimestamp((rev.activity as Activity).timestamp)
								}}</span>
							</div>
						</button>
					</li>
				</ul>
				<p v-else class="font-light italic">No revisions</p>
			</div>
		</Teleport>
	</div>

	<div v-if="!online" class="toast toast-top toast-center w-72">
		<div class="alert alert-error">
			<div>
				<span>You are offline. Editing has been disabled.</span>
			</div>
		</div>
	</div>

	<Modal
		sidebar-safe
		:class="{ 'modal-open': activeRevisionModalShown }"
		@hide="hideActiveRevisionModal"
	>
		<template #heading>
			<NuxtLink
				v-if="activeRevision"
				:title="'Profile of ' + getFullName((activeRevision.activity as Activity).user as DirectusUser)"
				target="_blank"
				:to="`/users/${((activeRevision.activity as Activity).user as DirectusUser).id}`"
				class="flex items-center gap-x-4"
			>
				<Avatar
					:user="((activeRevision.activity as Activity).user as DirectusUser)"
					avatar-class="w-10 border-2 border-secondary rounded-full overflow-hidden"
					:avatar-options="{ key: 'user-avatar' }"
				/>
				<div class="flex flex-col items-start">
					<span>{{ getFullName((activeRevision.activity as Activity).user as DirectusUser) }}</span>
					<span class="text-sm font-mono text-muted">{{ activeRevisionTimeString }}</span>
				</div>
			</NuxtLink>
		</template>

		<div v-if="activeRevision" data-theme="winter" class="rounded-daisy-box p-4 readonly-quill">
			<QuillReadOnly :key="activeRevision.id" :content="(activeRevision.data.content as any)" />
		</div>
	</Modal>
</template>

<script setup lang="ts">
// TODO: add quill-image-uploader and quill-blot-formatter and quill-cursors and quill-mention
// TODO: Check modules here https://vueup.github.io/vue-quill/guide/modules.html

import { QuillEditor } from '@vueup/vue-quill'
import { breakpointsTailwind } from '@vueuse/core'
import type { Quill, DeltaObject } from '@/types/quill'
import type {
	JoinRoomData,
	EditorEventData,
	JoinRoomResponse,
	DocumentSavedEventData,
	DiagramEventData,
	DiagramSavedEventData,
} from '@/types/document-sync'
import type {
	DirectusUsers as DirectusUser,
	DocumentsRelatedUsers as RelatedUser,
	DocumentsRelatedFiles as RelatedFile,
	DirectusFiles as File,
	DirectusRevisions as Revision,
	DirectusActivity as Activity,
	Documents as Document,
} from '@/types/directus'
import type { Diagram } from '@/types/diagram'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

interface DocumentRevision extends Revision {
	data: Partial<Document>
}

definePageMeta({
	layout: 'sidebar',
})

const directus = useDirectus()

//* SETUP SOCKET.IO
const nuxt = useNuxtApp()

// Recommended here for teardown to work properly: https://nuxt-socket-io.netlify.app/usage#composition-api
// Check the link if I need to use watchers, do stuff after sockets are torn down ($destroy), or if I need socket namespaces
nuxt.onUnmounted = onUnmounted
await getUser() // make sure user is ready and access token is fresh when loading document
const { accessToken, user } = useUser()

const socket = nuxt.$nuxtSocket({
	name: 'document-sync', // default - can be omitted
	// @ts-ignore-next-line
	auth: {
		token: accessToken.value,
	},
})

//* GETTING INITIAL IDS
const userId = user.value?.id
const documentId = getDocumentId()

function getDocumentId(): string {
	const {
		params: { id: documentId },
	} = useRoute()

	return documentId as string
}

//* JOINING COLLABORATION ROOM
// Array of user IDs in the session
let editingUserIds = $ref<string[]>([])
let documentChangeSinceSave = $ref<boolean>(false) // This is manipulated when joining document
// Array of DirectusUsers with names and avatars in the session
const editingUsers = computedAsync<DirectusUser[]>(
	() => {
		if (!editingUserIds.length) return []

		return query('directus_users', {
			filter: {
				id: {
					_in: editingUserIds,
				},
			},
			limit: -1,
		})
	},
	[] // initial state
)

const editingUsersString = $computed<string>(() => {
	// Can format strings like "Motorcycle, Bus, and Car"
	const formatter = new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })

	// Get array of user names with first + last with a space in-between, but only if both exist
	const editingUsersNames = editingUsers.value.map(({ first_name, last_name }) =>
		[first_name, last_name].filter(name => name).join(' ')
	)

	return formatter.format(editingUsersNames)
})

// Join room and wait until room is joined
let { document: initialDocument } = await joinDocument()

// If, for some reason we get disconnected, we have to rejoin when reconnected
socket.io.on('reconnect', async () => {
	;({ document: initialDocument } = await joinDocument())
})

const online = useOnline() // Disable quill and show alert when offline
// Reconnect when back online (this does not trigger 'reconnect' event of socket.io for some reason)
whenever(online, async () => {
	;({ document: initialDocument } = await joinDocument())
})

// When a user joins the doc, add them to the list of users so we can show their avatar
socket.on('user-joined', (joinedUserId: string) => {
	editingUserIds.push(joinedUserId)
})

// When a user leaves the doc, remove them from the list of users so we can remove their avatar
socket.on('user-left', (leftUserId: string) => {
	editingUserIds.splice(editingUserIds.indexOf(leftUserId), 1)
})

async function joinDocument(): Promise<JoinRoomResponse> {
	const res = await socket.emitP('join-document', {
		documentId,
		userId,
	} as JoinRoomData)

	if (!res.ok) await goBack(res.message)

	// Set initial users that are already in doc
	editingUserIds = res.usersInDocument

	/* We assume, that if there are other users than this user in the document, then the document has been changed since it was last saved,
	 and we enable the save button. It is not perfect, but it is the best we can do without diffing with the db,
	 and the backend will still not error if trying to save with no changes */
	if (res.usersInDocument.length > 1) documentChangeSinceSave = true

	return res
}

//* RELATION DOCUMENTS
// Since some can be private, this list needs a bit extra care
const relatedDocuments = $computed<Document[]>(() => {
	// Since some related documents can be private, and a doc can technically be related to a private doc that this user can't see, we need to filter out the null values here
	return (
		initialDocument?.related_documents
			?.map(rel => rel.related_document_id as Document)
			.filter(doc => doc) ?? []
	)
})

//* QUILL SETUP & EVENTS
let quill: Quill

// const editorToolbar = ref<HTMLDivElement>()
async function editorReady(quillElement: Quill) {
	if (!initialDocument) return await goBack('Could not get document') // we should not be able to get here with no doc

	quill = quillElement

	// Looks hacky, but the directus sdk and socket.io actually turns the content json string (of a Delta) into an object, so our Document type fails us here
	quillElement.setContents(initialDocument.content, 'silent')

	quillElement.on('text-change', (delta: DeltaObject) => {
		socket.emit('change-content', { documentId, delta } as EditorEventData)

		documentChangeSinceSave = true // when changing content, make save button active
	})
}

const quillModules = [useQuillMentions()]

// This can be used to show modal that allows user to select file from directus or upload a new one and the use this.quill to insert a link etc at the current cursor location
// function selectOrUploadFile() {
// 	console.warn('TODO: directus select / upload btn')
// 	console.log(this.quill)
// }

socket.on('content-changed', (delta: DeltaObject) => {
	quill.updateContents(delta, 'silent')
	documentChangeSinceSave = true // when changing content, make save button active
})

function goBack(message: string) {
	alert(message)
	return navigateTo('/documents')
}

//* RENAMING DOCUMENT
const renameDocumentInput = ref<HTMLInputElement>()
useFocus(renameDocumentInput, { initialValue: true })

// This field is initialized as the title of the document from the server, but is v-modelled to the input so changes can be emitted
const renameDocumentInputValue = ref<string>(initialDocument?.title as string)

// When document title input is changed, emit the new title to the server
const { ignoreUpdates: ignoreTitleChange } = watchIgnorable(renameDocumentInputValue, newTitle => {
	try {
		directus.auth.refresh() // make sure access token is fresh before renaming

		socket.emit('change-title', {
			documentId,
			title: newTitle,
		})

		documentChangeSinceSave = true // when changing title, make save button active
	} catch (err) {
		alert('There was an error renaming document')
		console.error(err)
	}
})

// When someone else changes the title, update the view here, but ignore the watcher so we don't emit it back to the server in a loop
socket.on('title-changed', (title: string) => {
	ignoreTitleChange(() => {
		renameDocumentInputValue.value = title
		documentChangeSinceSave = true // when title was changed, make save button active
	})
})

//* SAVING DOCUMENT
const lastDocumentSave = ref<DocumentSavedEventData | null>(null) // Raw object from socket.io
const lastDocumentSaveBy = ref<DirectusUser | null>(null) // User object from directus set by watcher when lastDocumentSave changes
let relativeDocumentSaveTimeString = $ref<string>('') // String that shows how long ago the doc was saved, updated in interval which is why we can't use computed

// Get the saving user's name when document was saved, then trigger an update of the relative save time string
whenever(lastDocumentSave, async (newSave, oldSave) => {
	if (newSave?.userId !== oldSave?.userId) {
		lastDocumentSaveBy.value = (await directus.users.readOne(newSave.userId)) as DirectusUser
	}

	documentChangeSinceSave = false // when content is saved, make save button disabled

	setRelativeDocumentSaveTimeString()
})

// Updating the string that shows last time doc was saved
function setRelativeDocumentSaveTimeString() {
	if (!lastDocumentSave.value) return

	const relativeTime = dateToRelativeTimestamp(lastDocumentSave.value.timestamp)

	if (!lastDocumentSaveBy.value) {
		relativeDocumentSaveTimeString = `Saved ${relativeTime}`
		return
	}

	const { first_name, last_name } = lastDocumentSaveBy.value

	relativeDocumentSaveTimeString = `Saved ${relativeTime} by ${[first_name, last_name]
		.filter(name => name)
		.join(' ')}`
}

// Every 15s update the UI to show how long ago the doc was saved
const documentSaveStringInterval = setInterval(setRelativeDocumentSaveTimeString, 15_000)

async function saveDocument(): Promise<boolean> {
	// Socket.io server needs a fresh access token for saving to work as user
	await directus.auth.refresh()

	const success = await socket.emitP('save-document', documentId)
	if (!success) alert('There was an error saving document')
	return success
}

// When the document is saved by anyone (self included), update the last save time and user
socket.on('document-saved', (saveEventData: DocumentSavedEventData) => {
	// Setting this will trigger a watcher to get the changing user's name and update the UI with a relative save time string
	lastDocumentSave.value = saveEventData

	// Sync so everyone has the same content after a save
	quill.setContents(saveEventData.document.content, 'silent')

	ignoreTitleChange(() => {
		renameDocumentInputValue.value = saveEventData.document.title as string
	})

	refreshDocumentRevisions()
})

//* REVISIONS
let documentRevisions = $ref<DocumentRevision[]>([])
await refreshDocumentRevisions()
async function refreshDocumentRevisions() {
	try {
		documentRevisions = (await getDocumentRevisions(
			initialDocument?.id as number
		)) as unknown as DocumentRevision[]
	} catch (err) {
		console.error(err)
		alert('There was an error getting document revisions')
	}
}

function getFullName(user: DirectusUser): string {
	const { first_name, last_name } = user
	return [first_name, last_name].filter(name => name).join(' ')
}

function dateStringFromTimestamp(timestamp: string): string {
	const date = new Date(timestamp)
	return date.toLocaleString()
}

// Modal handling
let activeRevision = $ref<DocumentRevision | null>(null)

const activeRevisionTimeString = $computed<string>(() => {
	if (!activeRevision) return ''
	return dateStringFromTimestamp((activeRevision.activity as Activity).timestamp)
})

let activeRevisionModalShown = $ref<boolean>(false)
function showActiveRevisionModal(revision: DocumentRevision) {
	activeRevision = revision
	activeRevisionModalShown = true
}
function hideActiveRevisionModal() {
	activeRevisionModalShown = false
}

//* DIAGRAM
async function saveDiagram(diagramData: Diagram) {
	try {
		// Socket.io server needs a fresh access token for saving to work as user
		await directus.auth.refresh()

		const success = await socket.emitP('save-diagram', {
			documentId,
			diagramData,
		} as DiagramEventData)

		if (!success) alert("There was an error saving document's diagram")
	} catch (err) {
		console.error(err)
		alert("There was an error saving the document's diagram")
	}
}
const lastDiagramSave = ref<DiagramSavedEventData | null>(null) // Raw object from socket.io
const lastDiagramSaveBy = ref<DirectusUser | null>(null) // User object from directus set by watcher when lastDiagramSave changes
let relativeDiagramSaveTimeString = $ref<string>('') // String that shows how long ago the daigram was saved, updated in interval which is why we can't use computed
const diagramContent = $computed<Diagram>(
	() => (lastDiagramSave.value?.diagram as Diagram) || initialDocument!.diagram
)

// Get the saving user's name when diagram was saved, then trigger an update of the relative save time string
whenever(lastDiagramSave, async (newSave, oldSave) => {
	if (newSave?.userId !== oldSave?.userId) {
		lastDiagramSaveBy.value = (await directus.users.readOne(newSave.userId)) as DirectusUser
	}

	setRelativeDiagramSaveTimeString()
})

// Updating the string that shows last time doc was saved
function setRelativeDiagramSaveTimeString() {
	if (!lastDiagramSave.value) return

	const relativeTime = dateToRelativeTimestamp(lastDiagramSave.value.timestamp)

	if (!lastDiagramSaveBy.value) {
		relativeDiagramSaveTimeString = `Saved ${relativeTime}`
		return
	}

	const { first_name, last_name } = lastDiagramSaveBy.value

	relativeDiagramSaveTimeString = `Saved ${relativeTime} by ${[first_name, last_name]
		.filter(name => name)
		.join(' ')}`
}

// Every 15s update the UI to show how long ago the doc was saved
const diagramSaveStringInterval = setInterval(setRelativeDiagramSaveTimeString, 15_000)

// When the diagram is saved by anyone (self included), update the last save time and user
socket.on('diagram-saved', (diagramEventData: DiagramSavedEventData) => {
	// Setting this will trigger a watcher to get the changing user's name and update the UI with a relative save time string
	lastDiagramSave.value = diagramEventData
})

//* POSITION OF SIDEBAR / MENU
const breakpoints = useBreakpoints(breakpointsTailwind)
const noSidebar = breakpoints.smallerOrEqual('lg')

onUnmounted(() => {
	clearInterval(documentSaveStringInterval)
	clearInterval(diagramSaveStringInterval)
	socket.disconnect()
})
</script>

<style scoped lang="postcss">
.quill-section :deep(.ql-toolbar) {
	@apply border-t-0 border-l-0 border-r-0;
}

/* Styling for quill-mention */
.quill-section :deep(.editor-toolbar),
.quill-section :deep(.ql-container) {
	.ql-mention-list-container {
		z-index: 9001;
		width: 270px;
		overflow: auto;
		background-color: #fff;
		border: 1px solid #f0f0f0;
		border-radius: 4px;
		box-shadow: 0 2px 12px 0 rgba(30, 30, 30, 0.08);
	}

	.ql-mention-loading {
		padding: 0 20px;
		font-size: 16px;
		line-height: 44px;
		vertical-align: middle;
	}

	.ql-mention-list {
		margin: 0;
		padding: 0;
		overflow: hidden;
		list-style: none;
	}

	.ql-mention-list-item {
		padding: 0 20px;
		font-size: 16px;
		line-height: 44px;
		vertical-align: middle;
		cursor: pointer;
	}

	.ql-mention-list-item.disabled {
		cursor: auto;
	}

	.ql-mention-list-item.selected {
		text-decoration: none;
		background-color: #d3e1eb;
	}

	.mention {
		width: 65px;
		height: 24px;
		margin-right: 2px;
		padding: 3px 0;
		background-color: #d3e1eb;
		border-radius: 6px;
		user-select: all;
	}

	.mention > span {
		margin: 0 3px;
	}
}

/* In revision modal, we have a readonly quill, which we don't want to style like the editor */
.readonly-quill :deep(.ql-toolbar) {
	@apply hidden;

	.readonly-quill :deep(.ql-blank::before) {
		@apply !text-muted !font-bold;
	}
}
</style>
