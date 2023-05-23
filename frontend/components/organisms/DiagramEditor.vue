<template>
	<div class="relative" v-bind="$attrs">
		<!-- <ap-menu id="menu"></ap-menu> -->
		<ap-menu-shape id="menu-shape"></ap-menu-shape>
		<div id="tip">
			<ul>
				<li>Long press to select multiple shapes</li>
			</ul>
		</div>
		<svg id="diagram" class="w-full h-full" tabindex="0">
			<g id="canvas"></g>
		</svg>
	</div>

	<div class="flex gap-x-2 items-center my-2">
		<!-- :disabled="!diagramChangeSinceSave" -->
		<button class="btn btn-accent gap-2" @click="saveDiagram">
			<Icon class="fill text-3xl">save</Icon>Save diagram
		</button>
		<span class="text-muted text-sm">{{ relativeSaveTimeString }}</span>
	</div>
</template>

<script setup lang="ts">
//* THANKS TO https://github.com/AlexeyBoiko/DgrmJS FOR THE APPROPRIATED SOURCE CODE
import { deserialize, serialize } from '@/DgrmJS/diagram/dgrm-serialization'
import { tipShow } from '@/DgrmJS/ui/ui'
import type { Diagram } from '@/types/diagram'

const { relativeSaveTimeString, editorContent } = defineProps<{
	relativeSaveTimeString: string
	editorContent: Diagram // when this changes, it is applied to the editor (it is not truly reactive)
}>()

onMounted(async () => {
	await import('@/DgrmJS/index.js')

	setEditorContent(editorContent)
})
watch(
	() => editorContent,
	(newContent, oldContent) => {
		if (newContent !== oldContent) {
			setEditorContent(newContent)
		}
	}
)

function setEditorContent(content: Diagram) {
	// reference to the canvas is available in this component through the import of DgrmJS/index.js
	// @ts-ignore
	if (deserialize(canvas, content)) {
		tipShow(false)
	}
}

const emit = defineEmits<{
	(e: 'save', diagram: Diagram): void
}>()

function saveDiagram() {
	// reference to the canvas is available in this component through the import of DgrmJS/index.js
	// @ts-ignore
	const diagramData: Diagram = serialize(canvas)
	emit('save', diagramData)
}
</script>

<style lang="postcss" scoped>
/* stylelint-disable-next-line */
#tip {
	position: absolute;
	top: 50%;
	left: 50%;
	min-width: 290px;
	transform: translate(-50%, -50%);
}

/* stylelint-disable-next-line */
#diagram {
	display: block;
	background-color: #fff;
	user-select: none;
	pointer-events: none;
	touch-action: none;
	-webkit-touch-callout: none;
}

:deep() {
	text {
		color: rgb(73, 80, 87);
		font-size: 16px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		white-space: pre-wrap;
	}

	textarea {
		padding: 10px;
		padding-top: 0.8em;
		overflow: hidden;
		color: transparent;
		font-size: 16px;
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		line-height: 1em;
		text-align: center;
		background-color: transparent;
		border: 0;
		outline: none;
		resize: none;
		caret-color: #fff;
	}

	[data-connect] {
		display: none;
	}

	.select path[data-key='selected'],
	.select .path-end,
	.select [data-connect],
	.highlight-e [data-key='end'] .path-end,
	.highlight-s [data-key='start'] .path-end,
	.hover [data-connect] {
		display: unset;
		opacity: 0.51;
		fill: rgb(108 187 247);
		stroke: rgb(108 187 247);
	}

	[data-connect].hover {
		stroke-width: 25px;
	}

	.select path[data-key='selected'] {
		fill: none;
	}

	.highlight [data-key='main'] {
		paint-order: stroke;
		stroke-width: 10px;
		stroke: rgb(108 187 247 / 0.51);
	}

	.shpath [data-key='end'] .path,
	.shpath [data-key='start'] .path {
		display: none;
	}

	.shpath.arw-e [data-key='end'] .path,
	.shpath.arw-s [data-key='start'] .path {
		display: unset;
	}

	.shpath.dash [data-key='path'] {
		stroke-dasharray: 5;
	}

	@media (pointer: coarse) {
		circle.path-end {
			r: 20px;
		}

		.ative-elem {
			stroke: rgb(108 187 247 / 0.51);
			stroke-width: 70px;
		}

		[data-connect] {
			stroke-width: 15px;
		}

		[data-connect].hover {
			stroke-width: 70px;
		}
	}

	/* rect, text shape */
	.shrect.ta-1 text,
	.shtxt.ta-1 text {
		text-anchor: start;
	}

	.shrect.ta-2 text,
	.shtxt.ta-2 text {
		text-anchor: middle;
	}

	.shrect.ta-3 text,
	.shtxt.ta-3 text {
		text-anchor: end;
	}

	.shrect.ta-1 textarea,
	.shtxt.ta-1 textarea {
		text-align: left;
	}

	.shrect.ta-2 textarea,
	.shtxt.ta-2 textarea {
		text-align: center;
	}

	.shrect.ta-3 textarea,
	.shtxt.ta-3 textarea {
		text-align: right;
	}

	.shtxt textarea {
		caret-color: rgb(73, 80, 87);
	}

	.shtxt text {
		fill: rgb(73, 80, 87);
	}

	.shtxt [data-key='main'] {
		fill: transparent;
		stroke: transparent;
	}

	.shtxt.select [data-key='main'],
	.shtxt.highlight [data-key='main'] {
		stroke: rgb(108 187 247 / 0.51);
		stroke-width: 2px;
	}

	/* rhomb shape */
	.shrhomb.highlight [data-key='border'] {
		stroke-width: 28px;
		stroke: rgb(108 187 247 / 0.51);
	}

	.shrhomb.highlight [data-key='main'] {
		stroke-width: 18px;
		stroke: #1d809f;
	}

	/* shape settings styles */
	.cl-red [data-key='main'] {
		fill: #e74c3c;
	}

	.cl-red .path {
		stroke: #e74c3c;
	}

	.cl-orange [data-key='main'] {
		fill: #f60;
	}

	.cl-orange .path {
		stroke: #f60;
	}

	.cl-green [data-key='main'] {
		fill: #19bc9b;
	}

	.cl-green .path {
		stroke: #19bc9b;
	}

	.cl-blue [data-key='main'] {
		fill: #1aaee5;
	}

	.cl-blue .path {
		stroke: #1aaee5;
	}

	.cl-dblue [data-key='main'] {
		fill: #1d809f;
	}

	.cl-dblue .path {
		stroke: #1d809f;
	}

	.cl-dgray [data-key='main'] {
		fill: #495057;
	}

	.cl-dgray .path {
		stroke: #495057;
	}

	.shtxt.cl-red [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-red text {
		fill: #e74c3c;
	}

	.shtxt.cl-orange [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-orange text {
		fill: #f60;
	}

	.shtxt.cl-green [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-green text {
		fill: #19bc9b;
	}

	.shtxt.cl-blue [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-blue text {
		fill: #1aaee5;
	}

	.shtxt.cl-dblue [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-dblue text {
		fill: #1d809f;
	}

	.shtxt.cl-dgray [data-key='main'] {
		fill: transparent;
	}

	.shtxt.cl-dgray text {
		fill: #495057;
	}

	.shrhomb.cl-red [data-key='main'] {
		stroke-width: 18px;
		stroke: #e74c3c;
	}

	.shrhomb.cl-orange [data-key='main'] {
		stroke-width: 18px;
		stroke: #f60;
	}

	.shrhomb.cl-green [data-key='main'] {
		stroke-width: 18px;
		stroke: #19bc9b;
	}

	.shrhomb.cl-blue [data-key='main'] {
		stroke-width: 18px;
		stroke: #1aaee5;
	}

	.shrhomb.cl-dblue [data-key='main'] {
		stroke-width: 18px;
		stroke: #1d809f;
	}

	.shrhomb.cl-dgray [data-key='main'] {
		stroke-width: 18px;
		stroke: #495057;
	}
}
</style>
