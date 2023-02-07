<template>
	<Modal box-classes="lg:ml-80">
		<!-- set a left margin of 80 to match width of sidebar when shown -->
		<template #heading>Select documents</template>

		<div class="grid gap-2 grid-cols-1 sm:grid-cols-2 mb-4">
			<input
				v-model="filterString"
				placeholder="Filter title"
				class="input input-sm input-bordered placeholder:text-muted"
			/>

			<FilterSelect
				v-model="selectedTags"
				name="tags"
				:options="allTags"
				multiple
				small
				label-prop="name"
				emit-prop="id"
				class="border-0 bg-base-300"
			>
				Filter tags
			</FilterSelect>
		</div>

		<div ref="documentGrid" class="document-grid">
			<!-- mini preview -->
			<button
				v-for="doc of filteredDocs"
				:key="doc.id"
				:class="{ 'bg-secondary/30': selected.includes(doc.id) }"
				class="card cursor-default shadow-lg hover:shadow-xl focus:shadow-2xl bg-base-200"
				@click="select(doc.id)"
			>
				<div class="card-body p-4">
					<h2 class="card-title text-base">{{ doc.title }}</h2>

					<div class="flex gap-1.5 flex-wrap">
						<span
							v-for="tag of (doc.tags as DocumentTag[])"
							:key="tag.id"
							class="badge badge-outline badge-secondary"
						>
							{{ (tag.tags_id as Tag)?.name }}
						</span>
					</div>
				</div>
			</button>
		</div>

		<template #actions>
			<button class="btn" @click="selectDocs">Select</button>
		</template>
	</Modal>
</template>

<script setup lang="ts">
import autoAnimate from '@formkit/auto-animate'
import type {
	Documents as Document,
	DocumentsTags as DocumentTag,
	Tags as Tag,
} from '@/types/directus'

const { currentDocumentId = null } = defineProps<{
	currentDocumentId?: string // this is used so we can filter off the current doc, since we don't want to be able to relate a doc to itself
}>()

const documents = await query<Document>('documents', {
	fields: [
		'*',
		'subscribers.directus_users_id.id',
		'subscribers.directus_users_id.avatar',
		'subscribers.directus_users_id.first_name',
		'subscribers.directus_users_id.last_name',
		'tags.id',
		'tags.tags_id.*',
	],
	filter: {
		id: {
			_neq: currentDocumentId,
		},
	},
	limit: -1,
})

//* FILTERING
const allTags = await readAll<Tag>('tags')
const selectedTags = $ref<number[]>([])
const filterString = $ref<string>('')

const filteredDocs = $computed<Document[]>(() => {
	return documents.filter(filterCheck)
})

function filterCheck(doc: Document) {
	// Check if doc has any of the selected tags (no selected tags shows all)
	const hasSelectedTags = selectedTags.length
		? selectedTags.some(tagId =>
				(doc.tags as DocumentTag[]).some(docTag => (docTag.tags_id as Tag).id === tagId)
		  )
		: true

	// Check if the filter string is in the title
	const hasFilterString = doc.title.toLowerCase().includes(filterString.toLowerCase())

	return hasSelectedTags && hasFilterString
}

// Animate on filter change
const documentGrid = ref<HTMLElement>()
onMounted(() => {
	autoAnimate(documentGrid.value as HTMLElement)
})

//* SELECTION
// Because of issues where selected elements cannot be compared (for some reason)
// we just select docs by their ID and then get the full docs with selected IDs when emitted
const { selected, select } = useSelection<number>()

const emit = defineEmits<{
	(e: 'select', docs: Document[]): void
}>()

function selectDocs() {
	const docs = documents.filter(doc => selected.value.includes(doc.id))
	emit('select', docs)
}
</script>

<style scoped lang="postcss">
.document-grid {
	@apply grid gap-2;

	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
</style>
