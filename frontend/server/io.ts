import type { Socket, BroadcastOperator } from 'socket.io'
import type { JoinRoomData, JoinRoomResponse, EditorEventData } from '@/types/document-sync'

// eslint-disable-next-line
const cookie = require('cookie')

// export const middlewares = {
// 	// rename if possible to auth
// 	auth(socket: Socket, next: () => void) {
// 		console.log('auth middleware')

// 		//* access & refresh token

// 		// const { directus_refresh_token } = cookie.parse(socket.handshake.headers.cookie)
// 		// console.log({ accessToken: socket.handshake.auth.token, refreshToken: directus_refresh_token })
// 		/* eslint-enable camelcase */

// 		// TODO: check if this user has access to documents

// 		next()
// 	},
// }

export default function (socket: Socket, io: BroadcastOperator<{ [event: string]: any }>) {
	return Object.freeze({
		async 'join-document'({ documentId, userId }: JoinRoomData): Promise<JoinRoomResponse> {
			//* access & refresh token

			// const { directus_refresh_token } = cookie.parse(socket.handshake.headers.cookie)
			const accessToken = socket.handshake.auth.token
			/* eslint-enable camelcase */

			// TODO: try to get the document from the database in parallel so it is faster, but only continue if user is authed
			// If user is not authed, don't let them join a room
			if (!(await checkUser(userId, accessToken))) {
				return { message: 'User is not authenticated', ok: false }
			}

			// Associate the socket with the directus user
			socket.data.userId = userId

			// Join the document's room
			socket.join(documentId)

			// Let everyone know that a user joined the document
			io.to(documentId).emit('user-joined', userId)

			// TODO: send document in returned data

			return { message: `user: ${userId} joined the document: ${documentId}`, ok: true }
		},

		'editor-change'({ documentId, delta }: EditorEventData) {
			// Broadcast to all others in the document's room
			socket.to(documentId).emit('editor-update', delta)
		},

		// disconnecting() {
		// 	// console.log(socket.id)
		// 	// console.log(socket.rooms)
		// 	io
		// },
	})
}

// // Socket ID => User object with everything needed
// const users = new Map<string, any>()

async function checkUser(userId: string, accessToken: string) {
	try {
		// Request user data with the given access token
		const res = await fetch(`http://localhost:8055/users/${userId}?access_token=${accessToken}`)

		// Request will fail if access token does not match the user, so we can return a success bool from res.ok
		// TODO: this might need to check if userId matches returned ID if at some point we can read some data from other users
		return res.ok
	} catch (err) {
		console.error(err)
		return false
	}
}
