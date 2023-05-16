import { Directus } from '@directus/sdk'
import Delta from 'quill-delta'
import fetch from 'node-fetch'
import type { Socket, BroadcastOperator } from 'socket.io'
import type {
	JoinRoomData,
	JoinRoomResponse,
	EditorEventData,
	TitleEventData,
	SocketUser,
	DocumentSavedEventData,
} from '@/types/document-sync'
import type { DeltaObject, DeltaDocument } from '@/types/quill'
import type { CustomDirectusTypes } from '@/types/directus'

// Annoying that we can't get nuxt context from here, since env var could be undef and we need to duplicate the fallback value
const directusUrl = process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'

/*
This is a map of all current rooms (sessions - one for each open document).
The map has the room/document ID as key and the value is a DocumentSession object.
*/
const rooms = new Map<string, DocumentSession>()

export default function (socket: Socket, io: BroadcastOperator<{ [event: string]: any }>) {
	return Object.freeze({
		async 'join-document'({ documentId, userId }: JoinRoomData): Promise<JoinRoomResponse> {
			const accessToken = socket.handshake.auth.token

			// Start document request so it can run in parallel with user check
			const documentPromise = DocumentSession.fetchDocument(documentId, accessToken) // all users have access to all docs, so as long as they are authenticated, they are also authorized to see documents

			// If user is not authed, don't let them join a room
			if (!(await checkUserAuth(userId, accessToken))) {
				return {
					message: 'User is not authenticated',
					ok: false,
					document: null,
					usersInDocument: [],
				}
			}

			// Check if room already exists
			let documentSession = rooms.get(documentId)

			let document: DeltaDocument | undefined | null

			// No room means user is first in the room, so we gotta fetch the initial document
			if (!documentSession) {
				// Now that user is authed, we can wait for the document to be ready
				document = await documentPromise
				if (!document) {
					return {
						message: 'There was an error getting document',
						ok: false,
						document: null,
						usersInDocument: [],
					}
				}

				// Create session with document from Directus and this socket / user as the first user
				documentSession = new DocumentSession(documentId, document, { socketId: socket.id, userId })
				rooms.set(documentId, documentSession)
			} else {
				// User is not first in room, so we can just add them to the room
				documentSession.addUser(socket.id, userId)

				// We then get the document from the existing room instead of going to Directus
				document = documentSession.document
			}

			// Associate the socket with the directus user
			socket.data.userId = userId

			// Join the document's room
			socket.join(documentId)

			// Let everyone know that a user joined the document
			io.to(documentId).emit('user-joined', userId)

			return {
				message: `user: ${userId} joined the document: ${documentId}`,
				ok: true,
				document,
				usersInDocument: Array.from(documentSession.users.values()),
			}
		},

		// Synchronizes content deltas between clients
		'change-content'({ documentId, delta }: EditorEventData) {
			if (!socketInRoom(socket, documentId)) {
				console.warn('User has not been authorized to change the document:', documentId)
				// TODO: something that can undo a specific delta in the frontend?
				// delta inversion can do this: https://github.com/quilljs/delta#invert
				return
			}

			const session = rooms.get(documentId)

			try {
				session?.applyDelta(delta)

				// Broadcast to all others in the document's room
				socket.to(documentId).emit('content-changed', delta)
			} catch (err) {
				console.error(err)
				// TODO: something that can undo a specific delta in the frontend?
				// delta inversion can do this: https://github.com/quilljs/delta#invert
			}
		},

		// Synchronizes document titles between clients
		'change-title'({ documentId, title }: TitleEventData) {
			if (!socketInRoom(socket, documentId)) {
				console.warn('User has not been authorized to change the document:', documentId)
				// TODO: something that can undo the title change in the frontend?
				return
			}

			const session = rooms.get(documentId)

			try {
				session?.renameDocument(title)

				// Broadcast to all others in the document's room
				socket.to(documentId).emit('title-changed', title)
			} catch (err) {
				console.error(err)
				// TODO: something that can undo the title change in the frontend?
			}
		},

		/* Takes a client's access token and saves the document of the user's session under the client's name.
		If user save fails, the server will try with a static token called 'Collaborative session' instead.
		Returns whether the save was successful regardless of whether it was by user or server. */
		async 'save-document'(documentId: string): Promise<boolean> {
			if (!socketInRoom(socket, documentId)) {
				console.warn('User has not been authorized to save the document:', documentId)

				return false
			}

			// Used to try and save document as user first, then as server if user fails
			const accessToken = socket.handshake.auth.token

			const session = rooms.get(documentId)

			if (!session) return false

			// Try with the user's access token...
			let savedDocument = await session.saveDocument(accessToken)
			if (!savedDocument) {
				// ... if user attempt failed, try with static token (no arg)
				savedDocument = await session.saveDocument()

				if (!savedDocument) {
					console.warn(`Saving document ${documentId} with static token failed`)
					return false
				}
			}

			// Broadcast to everyone in room that document was saved
			io.to(documentId).emit('document-saved', {
				userId: socket.data.userId,
				timestamp: Date.now(),
				document: savedDocument,
			} as DocumentSavedEventData)

			return true
		},

		disconnecting() {
			const socketRooms = Array.from(socket.rooms).filter(room => room !== socket.id)

			const { userId } = socket.data

			// Get all document sessions that this socket was in
			const sessions = socketRooms
				.map(roomId => rooms.get(roomId))
				.filter(session => session) as DocumentSession[] // can be undef, so we filter them out

			// Sign user out of document sessions that this socket was in
			for (const session of sessions) {
				session.removeUser(socket.id)
			}

			// Let everyone know that a user left the document(s)
			socket.to(socketRooms).emit('user-left', userId)

			// Check if last user in room and if so, save document using static token and close session
			for (const session of sessions) {
				if (!session.isEmpty) continue

				// No arg to saveDocument means it will use the static token
				session.saveDocument().then(() => rooms.delete(session.documentId))
			}
		},
	})
}

async function checkUserAuth(userId: string, accessToken: string) {
	try {
		// Request user data with the given access token
		const res = await fetch(
			`${trimTrailingSlash(directusUrl)}/users/${userId}?access_token=${accessToken}`
		)

		// Request will fail if access token does not match the user, so we can return a success bool from res.ok
		// TODO: this might need to check if userId matches returned ID if at some point we can read some data from other users
		return res.ok
	} catch (err) {
		console.error(err)
		return false
	}
}

// Takes a socket and a document/room ID and returns whether the socket has access to the document / room
function socketInRoom(socket: Socket, roomId: string): boolean {
	if (socket.rooms.has(roomId)) {
		return true
	}

	return false
}

class DocumentSession {
	static directus = new Directus<CustomDirectusTypes>(directusUrl)
	static directusToken = process.env.NUXT_COLLABORATIVE_DIRECTUS_TOKEN as string

	static fetchDocument(documentId: string, accessToken: string): Promise<DeltaDocument | null> {
		return this.directus
			.items('documents')
			.readOne(
				documentId,
				{
					fields: [
						'*',
						'related_documents.id',
						'related_documents.related_document_id.*',
						'related_users.id',
						'related_users.user_id.*',
						'related_files.id',
						'related_files.file_id.*',
					] as any[],
				},
				{
					requestOptions: {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					},
				}
			)
			.catch(err => {
				console.error(err)
				return null
			}) as unknown as Promise<DeltaDocument> // SDK automatically turns .content from json string into an object, so we can cast it here
	}

	documentId: string
	users: Map<string, string> // map of socket IDs to user IDs
	document: DeltaDocument

	constructor(documentId: string, document: DeltaDocument, { socketId, userId }: SocketUser) {
		this.documentId = documentId
		this.users = new Map()
		this.document = document

		// Add initial user
		this.addUser(socketId, userId)
	}

	// Returns whether any users are left in this session
	get isEmpty(): boolean {
		return this.users.size === 0
	}

	addUser(socketId: string, userId: string): Map<string, string> {
		return this.users.set(socketId, userId)
	}

	removeUser(socketId: string): boolean {
		return this.users.delete(socketId)
	}

	// Takes a delta and applies it to the session version of the document
	applyDelta(delta: DeltaObject): DeltaDocument {
		// Looks hacky since document.content is a json string i directus, but it is automatically parsed as an object (Delta) when fetched
		const documentDelta = new Delta(this.document.content)
		const change = new Delta(delta)

		const newContent = documentDelta.compose(change)

		this.document.content = newContent

		return this.document
	}

	// Takes a new title and rename document
	renameDocument(title: string): string {
		this.document.title = title

		return this.document.title
	}

	// Gets the persisted Directus version of this session's document
	fetchDocument(accessToken: string): Promise<DeltaDocument | null> {
		return DocumentSession.fetchDocument(this.documentId, accessToken)
	}

	// Persists the session cached document in Directus
	saveDocument(userAccessToken?: string): Promise<DeltaDocument | null> {
		const accessToken = userAccessToken || DocumentSession.directusToken

		return DocumentSession.directus
			.items('documents')
			.updateOne(
				this.document.id,
				{
					title: this.document.title,
					content: this.document.content as unknown as string, // SDK will automatically turn the Delta into a json string
				},
				{ fields: ['title', 'content'] },
				{
					requestOptions: {
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					},
				}
			)
			.catch(err => {
				console.warn(err)
				return null
			}) as unknown as Promise<DeltaDocument> // mute the error, this it to be expected, when there is no actual changes to the document
	}
}
