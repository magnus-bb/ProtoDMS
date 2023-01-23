import type { DeltaObject } from '@/types/quill'
import type { Documents as Document } from '@/types/directus'

export interface JoinRoomData {
	documentId: string
	userId: string
}

export interface JoinRoomResponse {
	message: string
	ok: boolean
	document: Document | null
}

export interface EditorEventData {
	documentId: string
	delta: DeltaObject
}
