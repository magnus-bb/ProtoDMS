import { moveEvtMobileFix } from '@/composables/DgrmJS/infrastructure/move-evt-mobile-fix.js'
import { CanvasSmbl } from '@/composables/DgrmJS/infrastructure/canvas-smbl.js'
import { moveScaleApplay } from '@/composables/DgrmJS/infrastructure/move-scale-applay.js'
import { evtRouteApplay } from '@/composables/DgrmJS/infrastructure/evt-route-applay.js'
import {
	copyPastApplay,
	groupSelectApplay,
} from '@/composables/DgrmJS/diagram/group-select-applay.js'
import { shapeTypeMap } from '@/composables/DgrmJS/shapes/shape-type-map.js'
import '@/composables/DgrmJS/ui/menu.js'
import '@/composables/DgrmJS/ui/shape-menu.js'
export { serialize, deserialize } from '@/composables/DgrmJS/diagram/dgrm-serialization.js'
export { tipShow } from '@/composables/DgrmJS/ui/ui.js'

export function useDiagram() {
	// @ts-ignore
	/** @type {import('./infrastructure/canvas-smbl.js').CanvasElement} */
	const canvas = document.getElementById('canvas')
	canvas[CanvasSmbl] = {
		data: {
			position: { x: 0, y: 0 },
			scale: 1,
			cell: 24,
		},
		shapeMap: shapeTypeMap(canvas),
	}

	moveEvtMobileFix(canvas.ownerSVGElement)
	evtRouteApplay(canvas.ownerSVGElement)
	copyPastApplay(canvas)
	groupSelectApplay(canvas) // groupSelectApplay must go before moveScaleApplay
	moveScaleApplay(canvas)

	/** @type { import('./ui/shape-menu').ShapeMenu } */
	document.getElementById('menu-shape').init(canvas)
}
