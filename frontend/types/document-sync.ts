import type { Delta } from '@/types/quill'

export interface JoinRoomData {
	documentId: string
	userId: string
}

export interface JoinRoomResponse {
	message: string
	ok: boolean
}

export interface EditorEventData {
	documentId: string
	delta: Delta
}
