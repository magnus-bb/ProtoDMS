<template>
	<main>
		<button @click="saveDocument">Save</button>
		<span class="text-muted text-sm">{{ relativeSaveTimeString }}</span>
		<div class="shadow-xl rounded-daisy-box p-2" data-theme="winter">
			<QuillEditor toolbar="full" class="!border-none" theme="snow" @ready="editorReady" />
		</div>
	</main>
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
import '@vueup/vue-quill/dist/vue-quill.snow.css'

//* SETUP SOCKET.IO
const nuxt = useNuxtApp()

// Recommended here for teardown to work properly: https://nuxt-socket-io.netlify.app/usage#composition-api
// Check the link if I need to use watchers, do stuff after sockets are torn down ($destroy), or if I need socket namespaces
nuxt.onUnmounted = onUnmounted
await getUser() // make sure user is ready when loading document
const { accessToken, user } = useUser()

const socket = nuxt.$nuxtSocket({
	name: 'document-sync', // default - can be omitted
	// @ts-ignore-next-line
	auth: {
		token: accessToken.value,
	},
})

//* GETTING INITIAL IDS AND JOINING COLLAB SESSION
const userId = user.value?.id
const documentId = getDocumentId()

function getDocumentId(): string {
	const {
		params: { id: documentId },
	} = useRoute()

	return documentId as string
}

// Join room and wait until room is joined
let { ok, message, document } = (await socket.emitP('join-document', {
	documentId,
	userId,
} as JoinRoomData)) as JoinRoomResponse

if (!ok) await goBack(message)

socket.io.on('reconnect', async () => {
	const joinRes = (await socket.emitP('join-document', {
		documentId,
		userId,
	} as JoinRoomData)) as JoinRoomResponse

	;({ ok, message, document } = joinRes)

	if (!ok) await goBack(message)
})

//* SAVING DOCUMENT
let lastSave: DocumentSavedEventData | null = null
// let lastSave = $ref<DocumentSavedEventData | null>(null)
let relativeSaveTimeString = $ref<string>('')

// Updating the string that shows last time doc was saved
function setRelativeSaveTimeString() {
	if (!lastSave) return

	const relativeTime = dateToRelativeTimestamp(lastSave.timestamp)

	relativeSaveTimeString = `Saved ${relativeTime} by ${lastSave.userId}`
}

// Every 15s update last save string
const saveStringInterval = setInterval(setRelativeSaveTimeString, 15_000)

function saveDocument() {
	// TODO: show error if save fails
	return socket.emitP('save-document', documentId)
}

//* THINGS THAT NEED QUILL
async function editorReady(quill: Quill) {
	if (!document) return await goBack('Could not get document') // we should not be able to get here with no doc

	// Looks hacky, but the directus sdk and socket.io actually turns the content json string (of a Delta) into an object, so our Document type fails us here
	quill.setContents(document.content)

	quill.on('text-change', (delta: DeltaObject) => {
		socket.emit('editor-change', { documentId, delta } as EditorEventData)
	})

	socket.on('editor-update', (delta: DeltaObject) => {
		quill.updateContents(delta, 'silent')
	})

	// When the document is saved by anyone (self included), update the last save time and user
	socket.on('document-saved', (saveEventData: DocumentSavedEventData) => {
		// TODO: get the user name from userId and save that instead of ID (check directus notification flow for example on how to get)

		lastSave = saveEventData

		// Sync so everyone has the same content after a save
		quill.setContents(saveEventData.document.content)

		setRelativeSaveTimeString()
	})
}

socket.on('user-joined', (joinedUserId: string) => {
	console.log('User joined the collaboration:', joinedUserId)
})

function goBack(message: string) {
	alert(message)
	return navigateTo('/documents')
}

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
