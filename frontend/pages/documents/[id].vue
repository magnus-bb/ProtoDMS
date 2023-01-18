<template>
	<div class="shadow-xl rounded-daisy-box p-2" data-theme="winter">
		<QuillEditor toolbar="full" class="!border-none" theme="snow" @ready="editorReady" />
	</div>
</template>

<script setup lang="ts">
// TODO: add quill-image-uploader and quill-blot-formatter and quill-cursors and quill-mention
// TODO: Check modules here https://vueup.github.io/vue-quill/guide/modules.html

import { QuillEditor } from '@vueup/vue-quill'
import type { Quill, Delta, Sources } from '@/types/quill'
import type { JoinRoomData, EditorEventData, JoinRoomResponse } from '@/types/document-sync'
import '@vueup/vue-quill/dist/vue-quill.snow.css'

//* SETUP SOCKET.IO
const nuxt = useNuxtApp()

// ? recommended here for teardown to work properly: https://nuxt-socket-io.netlify.app/usage#composition-api
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

const userId = user.value?.id
const documentId = getDocumentId()

// Join room and wait until room is joined
const { ok } = (await socket.emitP('join-document', {
	documentId,
	userId,
} as JoinRoomData)) as JoinRoomResponse

if (!ok) {
	alert('Could not join document')
	await navigateTo('/documents')
}

function getDocumentId(): string {
	const {
		params: { id: documentId },
	} = useRoute()

	return documentId as string
}

//* SETUP QUILL
function editorReady(quill: Quill) {
	quill.on('text-change', (delta: Delta, _, source: Sources) => {
		if (source === 'api') {
			console.log('An API call triggered this change.')
		} else if (source === 'user') {
			console.log('A user action triggered this change.')
		}

		socket.emit('editor-change', { documentId, delta } as EditorEventData)
	})

	socket.on('editor-update', (delta: Delta) => {
		quill.updateContents(delta, 'silent')
	})
}
</script>

<style scoped lang="postcss">
:deep(.ql-toolbar) {
	@apply border-t-0 border-l-0 border-r-0;
}
</style>
