import { listenDel } from './util.js'

export const MovementXSmbl = Symbol('movementX')
export const MovementYSmbl = Symbol('movementY')
/** @typedef {PointerEvent & { [MovementXSmbl]: number, [MovementYSmbl]: number }} PointerEventFixMovement */

/** @typedef { {x:number, y:number} } Point */

/** @param {Element} elem */
export function moveEvtMobileFix(elem) {
	/** @type {Point} */ let pointDown
	/** @type {number} */ let prevX
	/** @type {number} */ let prevY

	/** @param {PointerEventFixMovement} evt */
	function move(evt) {
		if (!evt.isPrimary || !evt.isTrusted) {
			return
		}

		// fix old Android
		if (
			pointDown &&
			Math.abs(pointDown.x - evt.offsetX) < 3 &&
			Math.abs(pointDown.y - evt.offsetY) < 3
		) {
			evt.stopImmediatePropagation()
			return
		}
		pointDown = null

		// fix iOS
		if (evt.movementX === undefined) {
			evt[MovementXSmbl] = prevX ? evt.offsetX - prevX : 0
			evt[MovementYSmbl] = prevY ? evt.offsetY - prevY : 0
			prevX = evt.offsetX
			prevY = evt.offsetY
		} else {
			evt[MovementXSmbl] = evt.movementX
			evt[MovementYSmbl] = evt.movementY
		}
	}

	elem.addEventListener(
		'pointerdown',
		/** @param {PointerEvent} evt */ evt => {
			pointDown = { x: evt.offsetX, y: evt.offsetY }
			prevX = null
			prevY = null
			elem.addEventListener('pointermove', move, { capture: true, passive: true })

			elem.addEventListener(
				'pointerup',
				_ => {
					listenDel(elem, 'pointermove', move, true)
				},
				{ capture: true, once: true, passive: true }
			)
		},
		{ capture: true, passive: true }
	)
}
