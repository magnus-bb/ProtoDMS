<template>
	<VNetworkGraph
		ref="network"
		:nodes="nodes"
		:edges="edges"
		:configs="configs"
		:event-handlers="eventHandlers"
	/>
</template>

<script setup lang="ts">
import * as vng from 'v-network-graph'
import { ForceLayout } from 'v-network-graph/lib/force-layout'
import type { ForceNodeDatum, ForceEdgeDatum } from 'v-network-graph/lib/force-layout'
import type { GraphNode } from '@/types/graph'

interface StyleObject {
	nodeColor: string
	edgeColor: string
	labelColor: string
}

const props = defineProps<{
	inputData: GraphNode[]
	styleObject: StyleObject
}>()

const nodes = computed<vng.Nodes>(() => {
	if (props.inputData && props.inputData.length > 0) {
		const nodes: vng.Nodes = {}
		props.inputData.forEach(entry => {
			nodes[entry.id] = { name: entry.title, size: getNodeSize(entry.id) }
		})
		return nodes
	}
	return {}
})

const edges = computed<vng.Edges>(() => {
	if (props.inputData && props.inputData.length > 0) {
		const edges: vng.Edges = {}
		props.inputData.forEach(entry => {
			entry.linkedNodes.forEach(nodeID => {
				edges[`edge-${entry.id}-${nodeID}`] = {
					source: entry.id.toString(),
					target: nodeID.toString(),
				}
			})
		})
		return edges
	}
	return {}
})

// base node size on edges to the node (beware of two-way duplicates. Filter these out)
// const nodeSizes = computed(() => {

// });

function getNodeSize(id: number): number {
	let nodeSize = 16
	for (const edgeTitle in edges.value) {
		if (edges.value[edgeTitle].target === id.toString()) {
			nodeSize += 2
		}
	}
	return nodeSize
}

const configs = reactive(
	vng.defineConfigs({
		view: {
			//   minZoomLevel: 0.1,
			//   maxZoomLevel: 10,
			layoutHandler: new ForceLayout({
				positionFixedByDrag: false,
				positionFixedByClickWithAltKey: true,
				createSimulation: (d3, nodes, edges) => {
					// d3-force parameters
					const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
					return d3
						.forceSimulation(nodes)
						.force('edge', forceLink.distance(200).strength(0.2))
						.force('charge', d3.forceManyBody().strength(-120))
						.force('center', d3.forceCenter().strength(0.5))
						.alphaMin(0.001)
				},
			}),
		},
		node: {
			label: {
				visible: true,
				color: props.styleObject.labelColor,
			},
			normal: {
				type: 'circle',
				radius: node => node.size,
				color: props.styleObject.nodeColor,
			},
		},
		edge: {
			normal: {
				color: props.styleObject.edgeColor,
			},
		},
	})
)

const emit = defineEmits(['nodeClick'])

const eventHandlers: vng.EventHandlers = {
	'node:click': ({ node }) => {
		emit('nodeClick', node)
	},
}

// const network = ref<vng.Instance>() // ref to the network graph instance
// console.log(network.value)

// onMounted(() => {
// 	setTimeout(() => {
// 		network.value?.fitToContents()
// 	}, 0)
// })
</script>
