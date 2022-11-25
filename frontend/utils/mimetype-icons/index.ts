/*
CREDIT: https://github.com/kravets-levko/pretty-file-icons
*/

// const path = require('path')
import extensions from './extensions.json'

type Extension = keyof typeof extensions

const unknown = extensions['']

const ICONS_FILE_EXTENSION = '.svg'

export function getMimetypeIcon(filename: string) {
	// Extract extension from the filename
	const ext = (isString(filename) ? getExtension(filename).toLowerCase() : '') as Extension

	return (extensions[ext] || unknown) + ICONS_FILE_EXTENSION
}

function isString(value: unknown) {
	return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]'
}

function getExtension(filename: string) {
	const bits = filename.split('.')

	return '.' + bits[bits.length - 1]
}
