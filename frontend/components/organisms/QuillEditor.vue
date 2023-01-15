<template>
	<div id="editor">
		<p>Hello World!</p>
		<p>Some initial <strong>bold</strong> text</p>
		<p><br /></p>
	</div>
</template>

<script setup>
import 'quill/dist/quill.snow.css'

import { io } from 'socket.io-client'
import Quill from 'quill'

const userId = Math.random().toString()
const documentId = 'document-id'

const socket = io('http://localhost:3001', {
	withCredentials: true,
})

socket.emit('join-document', documentId, userId)

onMounted(() => {
	const quill = new Quill('#editor', {
		theme: 'snow',
	})

	quill.on('text-change', (delta, _, source) => {
		if (source === 'api') {
			console.log('An API call triggered this change.')
		} else if (source === 'user') {
			console.log('A user action triggered this change.')
		}

		socket.emit('editor-change', documentId, delta)
	})

	socket.on('editor-update', delta => {
		console.log(delta)
		quill.updateContents(delta, 'silent')
	})
})
</script>

<style lang="postcss" scoped></style>
