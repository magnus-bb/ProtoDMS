import type { DirectusFolders as Folder } from '@/types/directus'

export interface TreeFolder extends Folder {
	children?: TreeFolder[]
}
