import mention from '@/node_modules/quill-mention/dist/quill.mention.esm.js'
import type { Quill } from '@/types/quill'

import type {
	DirectusUsers as DirectusUser,
	DirectusFiles as DirectusFile,
	Documents as Document,
} from '@/types/directus'

const atValues = [
	{ id: 1, value: 'Fredrik Sundqvist' },
	{ id: 2, value: 'Patrik Sjölin' },
]
const hashValues = [
	{ id: 3, value: 'Fredrik Sundqvist 2' },
	{ id: 4, value: 'Patrik Sjölin 2' },
]

const MENTION_DENOTATION_CHARS = ['@', 'person:', 'file:', 'document:'] as const
type MentionDenotationChar = typeof MENTION_DENOTATION_CHARS[number]

interface MentionItem {
	id: number | string
	value: string
}

export default function () {
	return {
		name: 'mention',
		module: mention,
		options: {
			showDenotationChar: false,
			isolateCharacter: true,
			mentionDenotationChars: MENTION_DENOTATION_CHARS,
			async source(
				searchTerm: string,
				renderList: (matches: MentionItem[], searchTerm: string) => void,
				mentionChar: MentionDenotationChar
			) {
				let values: MentionItem[] | undefined

				if (mentionChar === '@' || mentionChar === 'person:') {
					values = await getUsers(searchTerm) // request users with filter on full name
				} else if (mentionChar === 'file:') {
					values = await getFiles(searchTerm) // request files with filter on filename_download
				} else if (mentionChar === 'document:') {
					values = await getDocuments(searchTerm) // request documents with filter on title
				}

				if (values) renderList(values, searchTerm)
			},
			onSelect(item: MentionItem, insertItem: (item: MentionItem) => void) {
				// TODO: add the resource to the docs' linked resources and show them in sidebar

				insertItem(item)
			},
		},
	}
}

// Get all normal users or filter them by the searchTerm
const { authenticatedRoleId } = useRuntimeConfig().public
async function getUsers(searchTerm: string): Promise<MentionItem[]> {
	let mentionItems: MentionItem[] = []

	try {
		let users: DirectusUser[] = []

		if (!searchTerm) {
			users = await readAllUsers()
		} else {
			users = await query<DirectusUser>('directus_users', {
				filter: {
					role: authenticatedRoleId,
					_or: [
						{
							first_name: {
								_contains: searchTerm,
							},
						},
						{
							last_name: {
								_contains: searchTerm,
							},
						},
					],
				},
				limit: -1,
			})
		}

		mentionItems = users.map(user => ({
			id: user.id,
			value: [user.first_name, user.last_name].filter(name => name).join(' '),
		}))
	} catch (err) {
		console.error('[Could not get users]', err)
		alert('Could not get users')
	}

	return mentionItems
}

async function getFiles(searchTerm: string): Promise<MentionItem[]> {
	let mentionItems: MentionItem[] = []

	try {
		let files: DirectusFile[] = []

		if (!searchTerm) {
			files = await query<DirectusFile>('directus_files', {
				limit: -1,
			})
		} else {
			files = await query<DirectusFile>('directus_files', {
				filter: {
					filename_download: {
						_contains: searchTerm,
					},
				},
				limit: -1,
			})
		}

		mentionItems = files.map(file => ({ id: file.id, value: file.filename_download }))
	} catch (err) {
		console.error('[Could not get files]', err)
		alert('Could not get files')
	}

	return mentionItems
}

async function getDocuments(searchTerm: string) {
	let mentionItems: MentionItem[] = []

	try {
		let docs: Document[] = []

		if (!searchTerm) {
			docs = await query<Document>('documents', {
				limit: -1,
			})
		} else {
			docs = await query<Document>('documents', {
				filter: {
					title: {
						_contains: searchTerm,
					},
				},
				limit: -1,
			})
		}

		mentionItems = docs.map(doc => ({ id: doc.id, value: doc.title }))
	} catch (err) {
		console.error('[Could not get documents]', err)
		alert('Could not get documents')
	}

	return mentionItems
}
