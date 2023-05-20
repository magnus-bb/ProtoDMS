export interface Diagram {
	v: '1.1'
	s: Shape[]
}

interface Shape {
	position: { x: number; y: number }
	title: 'string'
	type: 0 | 1 | 2 | 3 | 4
}
