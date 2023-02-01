<template>
	<div class="p-4 flex flex-col gap-y-4">
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
						class="flex items-center gap-4 px-0 text-xl sm:text-3xl font-semibold tracking-wide h-12"
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
						:avatar-options="{ key: 'user-badge' }"
						class="w-8 text-sm"
						avatar-class="border-2 border-secondary"
					/>
				</div>
			</div>
		</header>

		<!-- document editor -->
		<main class="shadow-xl rounded-daisy-box p-2" data-theme="winter">
			<QuillEditor
				toolbar="full"
				class="!border-none"
				theme="snow"
				:enable="online"
				@ready="editorReady"
			/>
		</main>

		<!-- save button and save message -->
		<div class="space-y-2 mt-2">
			<button class="btn btn-accent gap-2" :disabled="!changeSinceSave" @click="saveDocument">
				<Icon class="fill text-3xl">save</Icon>Save changes
			</button>
			<p class="text-muted text-sm">{{ relativeSaveTimeString }}</p>
		</div>
	</div>

	<div v-if="!online" class="toast toast-top toast-center w-72">
		<div class="alert alert-error">
			<div>
				<span>You are offline. Editing has been disabled.</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
// TODO: add quill-image-uploader and quill-blot-formatter and quill-cursors and quill-mention
// TODO: Check modules here https://vueup.github.io/vue-quill/guide/modules.html

import { QuillEditor } from '@vueup/vue-quill'
import type { Quill, DeltaObject } from '@/types/quill'
import type {
	JoinRoomData,
	EditorEventData,
	JoinRoomResponse,
	DocumentSavedEventData,
} from '@/types/document-sync'
import type { DirectusUsers as DirectusUser } from '@/types/directus'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

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
let changeSinceSave = $ref<boolean>(false) // This is manipulated when joining document
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
	if (res.usersInDocument.length > 1) changeSinceSave = true

	return res
}

//* QUILL SETUP & EVENTS
let quill: Quill

async function editorReady(quillElement: Quill) {
	if (!initialDocument) return await goBack('Could not get document') // we should not be able to get here with no doc

	quill = quillElement

	// Looks hacky, but the directus sdk and socket.io actually turns the content json string (of a Delta) into an object, so our Document type fails us here
	quillElement.setContents(initialDocument.content, 'silent')

	quillElement.on('text-change', (delta: DeltaObject) => {
		socket.emit('change-content', { documentId, delta } as EditorEventData)

		changeSinceSave = true // when changing content, make save button active
	})
}

socket.on('content-changed', (delta: DeltaObject) => {
	quill.updateContents(delta, 'silent')
	changeSinceSave = true // when changing content, make save button active
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

		changeSinceSave = true // when changing title, make save button active
	} catch (err) {
		alert('There was an error renaming document')
		console.error(err)
	}
})

// When someone else changes the title, update the view here, but ignore the watcher so we don't emit it back to the server in a loop
socket.on('title-changed', (title: string) => {
	ignoreTitleChange(() => {
		renameDocumentInputValue.value = title
		changeSinceSave = true // when title was changed, make save button active
	})
})

//* SAVING DOCUMENT
const lastSave = ref<DocumentSavedEventData | null>(null) // Raw object from socket.io
const lastSaveBy = ref<DirectusUser | null>(null) // User object from directus set by watcher when lastSave changes
let relativeSaveTimeString = $ref<string>('') // String that shows how long ago the doc was saved, updated in interval which is why we can't use computed

// Get the saving user's name when document was saved, then trigger an update of the relative save time string
whenever(lastSave, async (newSave, oldSave) => {
	if (newSave?.userId !== oldSave?.userId) {
		lastSaveBy.value = (await directus.users.readOne(newSave.userId)) as DirectusUser
	}

	changeSinceSave = false // when content is saved, make save button disabled

	setRelativeSaveTimeString()
})

// Updating the string that shows last time doc was saved
function setRelativeSaveTimeString() {
	if (!lastSave.value) return

	const relativeTime = dateToRelativeTimestamp(lastSave.value.timestamp)

	if (!lastSaveBy.value) {
		relativeSaveTimeString = `Saved ${relativeTime}`
		return
	}

	const { first_name, last_name } = lastSaveBy.value

	relativeSaveTimeString = `Saved ${relativeTime} by ${[first_name, last_name]
		.filter(name => name)
		.join(' ')}`
}

// Every 15s update the UI to show how long ago the doc was saved
const saveStringInterval = setInterval(setRelativeSaveTimeString, 15_000)

async function saveDocument(): Promise<boolean> {
	// Socket.io server needs a fresh access token for saving to work as user
	await directus.auth.refresh()

	const success = socket.emitP('save-document', documentId)
	if (!success) alert('There was an error saving document')
	return success
}

// When the document is saved by anyone (self included), update the last save time and user
socket.on('document-saved', (saveEventData: DocumentSavedEventData) => {
	// Setting this will trigger a watcher to get the changing user's name and update the UI with a relative save time string
	lastSave.value = saveEventData

	// Sync so everyone has the same content after a save
	quill.setContents(saveEventData.document.content, 'silent')

	ignoreTitleChange(() => {
		renameDocumentInputValue.value = saveEventData.document.title as string
	})
})

onUnmounted(() => {
	clearInterval(saveStringInterval)
	socket.disconnect()
})
</script>

<style scoped lang="postcss">
:deep(.ql-toolbar) {
	@apply border-t-0 border-l-0 border-r-0;
}
</style>
