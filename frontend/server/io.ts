import { Directus } from '@directus/sdk'
import Delta from 'quill-delta'
import type { Socket, BroadcastOperator } from 'socket.io'
import type { JoinRoomData, JoinRoomResponse, EditorEventData } from '@/types/document-sync'
import type { Documents as Document } from '@/types/directus'

// Annoying that we can't get nuxt context from here, since env var could be undef and we need to duplicate the fallback value
const directusUrl = process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'

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
		// TODO: joining and syncing ('join-document' and 'editor-change' events)
		/*
		1. Auth user
		2. Check if user is first in room
		3. If so, get document Delta from directus and save it ON the room or in a global map of rooms => Deltas
		4. If not, get document Delta from global map of rooms => Deltas
		5. Let all other users know that a new user joined the document room
		6. When a Delta is received, apply it to the global map of rooms => Deltas and broadcast Delta (not full doc) to everyone
		7. When a user disconnects from room, broadcast to everyone that a user left the document and check if user was the last in room
		8. If user was last in room, server uses static static token called 'Collaborative session' to check if cached version matches saved version, if not, use token to save cached version in Directus and clean up room from global map
		*/

		// TODO: saving ('save-document' event)
		/*
		Event takes 2 args: documentId and accessToken
		1. Use access token to save server cached document to directus
		2. If access token fails, server uses static token called 'Collaborative session' to save document to directus
		3. Broadcast save timestamp to everyone in room
		4. Frontends show when the document was last saved next to save button
		*/

		// TODO: sync errors ('synchronize')
		/*
		Event takes 1 arg: documentId
		1. Every 15s the frontend should ping this event
		2. Server checks if user is in the room of documentId
		3. If so, server returns the cached document to frontend
		4. Frontend applies cached version to editor in UI to overwrite
		*/

		async 'join-document'({ documentId, userId }: JoinRoomData): Promise<JoinRoomResponse> {
			const accessToken = socket.handshake.auth.token

			// Start document request so it can run in parallel with user check
			const documentPromise = getDocument(documentId, accessToken) // all users have access to all docs, so as long as they are authenticated, they are also authorized to see documents

			// If user is not authed, don't let them join a room
			if (!(await checkUser(userId, accessToken))) {
				return { message: 'User is not authenticated', ok: false, document: null }
			}

			// If user is authed, we can wait for the document to be ready
			const document = await documentPromise
			if (!document) {
				return { message: 'There was an error getting document', ok: false, document: null }
			}

			// Associate the socket with the directus user
			socket.data.userId = userId

			// Join the document's room
			socket.join(documentId)

			// Let everyone know that a user joined the document
			io.to(documentId).emit('user-joined', userId)

			return { message: `user: ${userId} joined the document: ${documentId}`, ok: true, document }
		},

		'editor-change'({ documentId, delta }: EditorEventData) {
			// const newDelta = new Delta(delta)

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
		const res = await fetch(`${directusUrl}users/${userId}?access_token=${accessToken}`)

		// Request will fail if access token does not match the user, so we can return a success bool from res.ok
		// TODO: this might need to check if userId matches returned ID if at some point we can read some data from other users
		return res.ok
	} catch (err) {
		console.error(err)
		return false
	}
}

function getDocument(documentId: string, accessToken: string): Promise<Document> | null {
	try {
		const directus = new Directus(directusUrl)

		return directus.items('documents').readOne(
			documentId,
			{},
			{
				requestOptions: {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			}
		) as Promise<Document>
	} catch (err) {
		console.error(err)
		return null
	}
}
