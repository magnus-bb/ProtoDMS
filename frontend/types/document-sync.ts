import type { DeltaObject, DeltaDocument } from '@/types/quill'

// Used to map between sockets and directus users
export interface SocketUser {
	socketId: string
	userId: string
}

export interface JoinRoomData {
	documentId: string
	userId: string
}

export interface JoinRoomResponse {
	message: string
	ok: boolean
	document: DeltaDocument | null
	usersInDocument: string[]
}
export interface EditorEventData {
	documentId: string
	delta: DeltaObject
}
export interface TitleEventData {
	documentId: string
	title: string
}

export interface DocumentSavedEventData {
	userId: string
	timestamp: number // Result of Date.now()
	document: DeltaDocument
}
