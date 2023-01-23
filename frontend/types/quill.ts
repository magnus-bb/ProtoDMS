// Appropriated from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a4a4b34c7a082fcd2435a8eaa5acec89cd3e0fd6/types/quill/index.d.ts

import type { Blot } from 'parchment/dist/src/blot/abstract/blot'
import type { Op } from 'quill-delta'
import type { Documents as Document } from '@/types/directus'

export interface DeltaDocument extends Omit<Document, 'content'> {
	content: DeltaObject
}

export interface DeltaObject {
	ops: Op[]
}
/**
 * A stricter type definition would be:
 *
 *   type DeltaOperation ({ insert: any } | { delete: number } | { retain: number }) & OptionalAttributes;
 *
 *  But this would break a lot of existing code as it would require manual discrimination of the union types.
 */
export type DeltaOperation = {
	insert?: any
	delete?: number | undefined
	retain?: number | undefined
} & OptionalAttributes

export type Sources = 'api' | 'user' | 'silent'

export interface Key {
	key: string | number
	shortKey?: boolean | null | undefined
	shiftKey?: boolean | null | undefined
	altKey?: boolean | null | undefined
	metaKey?: boolean | null | undefined
	ctrlKey?: boolean | null | undefined
}

export interface StringMap {
	[key: string]: any
}

export interface OptionalAttributes {
	attributes?: StringMap | undefined
}

export type TextChangeHandler = (
	delta: DeltaObject,
	oldContents: DeltaObject,
	source: Sources
) => any
export type SelectionChangeHandler = (
	range: RangeStatic,
	oldRange: RangeStatic,
	source: Sources
) => any
export type EditorChangeHandler =
	| ((name: 'text-change', delta: DeltaObject, oldContents: DeltaObject, source: Sources) => any)
	| ((name: 'selection-change', range: RangeStatic, oldRange: RangeStatic, source: Sources) => any)

export interface KeyboardStatic {
	addBinding(key: Key, callback: (range: RangeStatic, context: any) => void): void
	addBinding(key: Key, context: any, callback: (range: RangeStatic, context: any) => void): void
}

export type ClipboardMatcherCallback = (node: any, delta: DeltaObject) => DeltaObject
export type ClipboardMatcherNode = string | number

export interface ClipboardStatic {
	matchers: Array<[ClipboardMatcherNode, ClipboardMatcherCallback]>
	convert(
		content?: { html?: string | undefined; text?: string | undefined },
		formats?: StringMap
	): DeltaObject
	addMatcher(selectorOrNodeType: ClipboardMatcherNode, callback: ClipboardMatcherCallback): void
	dangerouslyPasteHTML(html: string, source?: Sources): void
	dangerouslyPasteHTML(index: number, html: string, source?: Sources): void
}

export interface QuillOptionsStatic {
	debug?: string | boolean | undefined
	modules?: StringMap | undefined
	placeholder?: string | undefined
	readOnly?: boolean | undefined
	theme?: string | undefined
	formats?: string[] | undefined
	bounds?: HTMLElement | string | undefined
	scrollingContainer?: HTMLElement | string | undefined
	strict?: boolean | undefined
}

export interface BoundsStatic {
	bottom: number
	left: number
	right: number
	top: number
	height: number
	width: number
}

export interface RangeStatic {
	index: number
	length: number
}

export interface History {
	clear(): void
	cutoff(): void
	undo(): void
	redo(): void
}

export interface EventEmitter {
	on(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	on(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	on(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
	once(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	once(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	once(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
	off(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	off(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	off(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
}

export interface Quill {
	/**
	 * Internal API
	 */
	root: HTMLDivElement
	clipboard: ClipboardStatic
	scroll: Blot
	keyboard: KeyboardStatic
	history: History
	deleteText(index: number, length: number, source?: Sources): DeltaObject
	disable(): void
	enable(enabled?: boolean): void
	isEnabled(): boolean
	getContents(index?: number, length?: number): DeltaObject
	getLength(): number
	getText(index?: number, length?: number): string
	insertEmbed(index: number, type: string, value: any, source?: Sources): DeltaObject
	insertText(index: number, text: string, source?: Sources): DeltaObject
	insertText(index: number, text: string, format: string, value: any, source?: Sources): DeltaObject
	insertText(index: number, text: string, formats: StringMap, source?: Sources): DeltaObject
	/**
	 * @deprecated Remove in 2.0. Use clipboard.dangerouslyPasteHTML(index: number, html: string, source: Sources)
	 */
	pasteHTML(index: number, html: string, source?: Sources): string
	/**
	 * @deprecated Remove in 2.0. Use clipboard.dangerouslyPasteHTML(html: string, source: Sources): void;
	 */
	pasteHTML(html: string, source?: Sources): string
	setContents(delta: DeltaObject, source?: Sources): DeltaObject
	setText(text: string, source?: Sources): DeltaObject
	update(source?: Sources): void
	updateContents(delta: DeltaObject, source?: Sources): DeltaObject

	format(name: string, value: any, source?: Sources): DeltaObject
	formatLine(index: number, length: number, source?: Sources): DeltaObject
	formatLine(
		index: number,
		length: number,
		format: string,
		value: any,
		source?: Sources
	): DeltaObject
	formatLine(index: number, length: number, formats: StringMap, source?: Sources): DeltaObject
	formatText(index: number, length: number, source?: Sources): DeltaObject
	formatText(
		index: number,
		length: number,
		format: string,
		value: any,
		source?: Sources
	): DeltaObject
	formatText(index: number, length: number, formats: StringMap, source?: Sources): DeltaObject
	formatText(range: RangeStatic, format: string, value: any, source?: Sources): DeltaObject
	formatText(range: RangeStatic, formats: StringMap, source?: Sources): DeltaObject
	getFormat(range?: RangeStatic): StringMap
	getFormat(index: number, length?: number): StringMap
	removeFormat(index: number, length: number, source?: Sources): DeltaObject

	blur(): void
	focus(): void
	getBounds(index: number, length?: number): BoundsStatic
	getSelection(focus: true): RangeStatic
	getSelection(focus?: false): RangeStatic | null
	hasFocus(): boolean
	setSelection(index: number, length: number, source?: Sources): void
	setSelection(range: RangeStatic, source?: Sources): void

	addContainer(classNameOrDomNode: string | Node, refNode?: Node): any
	getModule(name: string): any

	// Blot interface is not exported on Parchment
	getIndex(blot: any): number
	getLeaf(index: number): any
	getLine(index: number): [any, number]
	getLines(index?: number, length?: number): any[]
	getLines(range: RangeStatic): any[]

	// EventEmitter methods
	on(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	on(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	on(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
	once(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	once(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	once(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
	off(eventName: 'text-change', handler: TextChangeHandler): EventEmitter
	off(eventName: 'selection-change', handler: SelectionChangeHandler): EventEmitter
	off(eventName: 'editor-change', handler: EditorChangeHandler): EventEmitter
}

export default Quill
