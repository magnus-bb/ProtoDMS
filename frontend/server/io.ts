import type { Socket /*, BroadcastOperator */ } from 'socket.io'
import type { JoinRoomData, EditorEventData } from '@/types/document-sync'

// eslint-disable-next-line
const cookie = require('cookie')

export const middlewares = {
	// rename if possible to auth
	auth(socket: Socket, next: () => void) {
		//* access & refresh token
		/* eslint-disable camelcase */
		const { directus_refresh_token } = cookie.parse(socket.handshake.headers.cookie)
		console.log({ accessToken: socket.handshake.auth.token, refreshToken: directus_refresh_token })
		/* eslint-enable camelcase */

		// TODO: check if this user has access to documents

		next()
	},
}

export default function (socket: Socket /* , io: BroadcastOperator */) {
	return Object.freeze({
		'join-document'({ documentId, userId }: JoinRoomData): { message: string } {
			socket.join(documentId)

			return { message: `user: ${userId} joined the document: ${documentId}` }
		},

		'editor-change'({ documentId, delta }: EditorEventData) {
			// Broadcast to all others in the document's room
			socket.to(documentId).emit('editor-update', delta)
		},
	})
}
