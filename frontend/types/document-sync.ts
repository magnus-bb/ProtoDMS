import type { Delta } from '@/types/quill'

export interface JoinRoomData {
	documentId: string
	userId: string
}

export interface EditorEventData {
	documentId: string
	delta: Delta
}
