import { Directus } from '@directus/sdk'
import Delta from 'quill-delta'
import type { Socket, BroadcastOperator } from 'socket.io'
import type { JoinRoomData, JoinRoomResponse, EditorEventData } from '@/types/document-sync'
import type { DeltaObject, DeltaDocument } from '@/types/quill'
import type { Documents as Document, CustomDirectusTypes } from '@/types/directus'

// Annoying that we can't get nuxt context from here, since env var could be undef and we need to duplicate the fallback value
const directusUrl = process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'

/*
This is a map of all current rooms (sessions - one for each open document).
The map has the room/document ID as key and the value is a DocumentSession object.
*/
const rooms = new Map<string, DocumentSession>()

export default function (socket: Socket, io: BroadcastOperator<{ [event: string]: any }>) {
	return Object.freeze({
		// TODO 1: joining and syncing ('join-document' and 'editor-change' events)
		/*
		1. X Auth user
		2. X Check if user is first in room
		3. X If so, get document Delta from directus and save it in a global map of rooms => Deltas
		4. X If not, get document Delta from global map of rooms => Deltas
		5. X Let all other users know that a new user joined the document room
		6. X When a Delta is received, apply it to the global map of rooms => Deltas and broadcast Delta (not full doc) to everyone
		7. X When a user disconnects from room, broadcast to everyone that a user left the document and check if user was the last in room
		8. If user was last in room, server uses static static token called 'Collaborative session' to check if cached version matches saved version, if not, use token to save cached version in Directus and clean up room from global map
		*/

		// TODO 2: saving ('save-document' event)
		/*
		Event takes 2 args: documentId and accessToken
		1. Use access token to save server cached document to directus
		2. If access token fails, server uses static token called 'Collaborative session' to save document to directus
		3. Broadcast save timestamp to everyone in room
		4. Frontends show when the document was last saved next to save button
		*/

		// TODO 3: sync errors ('synchronize')
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
			const documentPromise = DocumentSession.fetchDocument(documentId, accessToken) // all users have access to all docs, so as long as they are authenticated, they are also authorized to see documents

			// If user is not authed, don't let them join a room
			if (!(await checkUser(userId, accessToken))) {
				return { message: 'User is not authenticated', ok: false, document: null }
			}

			// Check if room already exists
			const documentSession = rooms.get(documentId)

			let document: DeltaDocument | undefined | null

			// No room means user is first in the room, so we gotta fetch the initial document
			if (!documentSession) {
				// Now that user is authed, we can wait for the document to be ready
				document = await documentPromise
				if (!document) {
					return { message: 'There was an error getting document', ok: false, document: null }
				}

				rooms.set(documentId, new DocumentSession(documentId, document, userId))
			} else {
				// User is not first in room, so we can just add them to the room
				documentSession.addUser(userId)

				// We then get the document from the existing room instead of going to Directus
				document = documentSession.document
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
			if (!socket.rooms.has(documentId)) {
				console.warn('User has not been authorized to change the document:', documentId)
				// TODO: something that can undo a specific delta in the frontend?
				return
			}

			const session = rooms.get(documentId)

			try {
				session?.applyDelta(delta)

				// Broadcast to all others in the document's room
				socket.to(documentId).emit('editor-update', delta)
			} catch (err) {
				console.error(err)
				// TODO: something that can undo a specific delta in the frontend?
			}
		},

		disconnecting() {
			const socketRooms = Array.from(socket.rooms).filter(room => room !== socket.id)

			const { userId } = socket.data

			// Get all document sessions that this socket was in
			const sessions = socketRooms
				.map(roomId => rooms.get(roomId))
				.filter(session => session) as DocumentSession[]

			// Sign user out of document sessions that this socket was in
			for (const session of sessions) {
				session.removeUser(userId)
			}

			// Let everyone know that a user left the document(s)
			socket.to(socketRooms).emit('user-left', userId)

			// Check if last user in room and save document if so using static token, then close the session
			for (const session of sessions) {
				if (!session.isEmpty) continue

				session.saveDocument()

				// session.fetchDocument(DocumentSession.directusToken).then(document => {

				// 	// If it seems like there is no doc in Directus (but there should be) just go directly to saving it to make sure
				// 	if (!document) {
				// 	} else {
				// 		// TODO: If document exists, check if it differs from cached version, if so, save it

				// 	}
				// })
			}

			console.log('----->', socket.rooms)

			// TODO 1 step 8
		},
	})
}

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
class DocumentSession {
	static directus = new Directus<CustomDirectusTypes>(directusUrl)
	static directusToken = process.env.NUXT_COLLABORATIVE_DIRECTUS_TOKEN as string

	static fetchDocument(documentId: string, accessToken: string): Promise<DeltaDocument | null> {
		return this.directus
			.items('documents')
			.readOne(
				documentId,
				{},
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
	users: Set<string>
	document: DeltaDocument

	constructor(documentId: string, document: DeltaDocument, firstUser: string) {
		this.documentId = documentId
		this.users = new Set()
		this.document = document

		this.addUser(firstUser)
	}

	// Returns whether any users are left in this session
	get isEmpty(): boolean {
		return this.users.size === 0
	}

	addUser(userId: string): Set<string> {
		return this.users.add(userId)
	}

	removeUser(userId: string): boolean {
		return this.users.delete(userId)
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

	// Gets the persisted Directus version of this session's document
	fetchDocument(accessToken: string): Promise<DeltaDocument | null> {
		return DocumentSession.fetchDocument(this.documentId, accessToken)
	}

	// Persists the session cached document in Directus
	saveDocument(): Promise<Document | null> {
		const accessToken = DocumentSession.directusToken

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
			.catch(_ => null) as Promise<Document> // mute the error, this it to be expected, when there is no actual changes to the document
	}

	// setDocument(document: Document): Document {
	// 	this.document = document
	// 	return this.document
	// }
}
