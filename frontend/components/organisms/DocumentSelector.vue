<template>
	<Modal @hide="reset">
		<!-- set a left margin of 80 to match width of sidebar when shown -->
		<div v-if="currentDocument?.related_documents?.length">
			<h3 class="text-lg font-bold mb-4">Remove related documents</h3>

			<div class="document-grid mt-4">
				<!-- mini preview -->
				<button
					v-for="rel of (currentDocument.related_documents as RelatedDocument[])"
					:key="rel.id"
					class="card cursor-default shadow-lg hover:shadow-xl focus:shadow-2xl bg-base-200"
					:class="{ 'bg-error/50': selectedToRemove.includes((rel.related_document_id as Document).id) }"
					@click="selectToRemove((rel.related_document_id as Document).id)"
				>
					<!-- CLICK TO REMOVE ITEM AND REFRESH DOCS -->
					<div class="card-body p-4">
						<h2 class="card-title text-base">
							{{ (rel.related_document_id as Document).title }}
						</h2>

						<div class="flex gap-1.5 flex-wrap">
							<span
								v-for="tag of ((rel.related_document_id as Document).tags as DocumentTag[])"
								:key="tag.id"
								class="badge badge-outline badge-secondary"
							>
								{{ (tag.tags_id as Tag)?.name }}
							</span>
						</div>
					</div>
				</button>
			</div>
		</div>

		<h3 class="mt-6 text-lg font-bold mb-4">Add related documents</h3>

		<div class="grid gap-2 grid-cols-1 sm:grid-cols-2 mt-4">
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

		<div ref="documentGrid" class="document-grid mt-4">
			<!-- mini preview -->
			<button
				v-for="doc of filteredDocs"
				:key="doc.id"
				class="card cursor-default shadow-lg hover:shadow-xl focus:shadow-2xl bg-base-200"
				:class="{ 'bg-primary/30': selectedToAdd.includes(doc.id) }"
				@click="selectToAdd(doc.id)"
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
			<button
				class="btn btn-block btn-accent"
				:disabled="!selectedToAdd?.length && !selectedToRemove?.length"
				@click="updateRelatedDocuments"
			>
				Update
			</button>
		</template>
	</Modal>
</template>

<script setup lang="ts">
// TODO: vis både related_document_id og document_id i relaterede
import autoAnimate from '@formkit/auto-animate'
import type {
	Documents as Document,
	DocumentsTags as DocumentTag,
	DocumentsRelatedDocuments as RelatedDocument,
	Tags as Tag,
} from '@/types/directus'

const { currentDocument = null } = defineProps<{
	currentDocument?: Document // this is used so we can filter off the current doc, since we don't want to be able to relate a doc to itself
}>()

let documents: Document[] = []
await refreshDocuments()
async function refreshDocuments() {
	documents = await query<Document>('documents', {
		fields: [
			'*',
			'subscribers.directus_users_id.id',
			'subscribers.directus_users_id.avatar',
			'subscribers.directus_users_id.first_name',
			'subscribers.directus_users_id.last_name',
			'tags.id',
			'tags.tags_id.*',
		],
		limit: -1,
	})
}
// documents = await query<Document>('documents', {
// 	fields: [
// 		'*',
// 		'subscribers.directus_users_id.id',
// 		'subscribers.directus_users_id.avatar',
// 		'subscribers.directus_users_id.first_name',
// 		'subscribers.directus_users_id.last_name',
// 		'tags.id',
// 		'tags.tags_id.*',
// 	],
// 	limit: -1,
// })

//* FILTERING
const allTags = await readAll<Tag>('tags')
let selectedTags = $ref<number[]>([])
let filterString = $ref<string>('')

const filteredDocs = $computed<Document[]>(() => {
	if (!currentDocument) return []
	return documents.filter(filterCheck)
})

function filterCheck(doc: Document) {
	const isNotCurrentDoc = doc.id !== currentDocument?.id

	const isRelatedToCurrentDoc = (currentDocument?.related_documents as RelatedDocument[]).some(
		rel => (rel.related_document_id as Document).id === doc.id
	)

	// Check if doc has any of the selected tags (no selected tags shows all)
	const hasSelectedTags = selectedTags.length
		? selectedTags.some(tagId =>
				(doc.tags as DocumentTag[]).some(docTag => (docTag.tags_id as Tag).id === tagId)
		  )
		: true

	// Check if the filter string is in the title
	const hasFilterString = doc.title.toLowerCase().includes(filterString.toLowerCase())

	return hasSelectedTags && hasFilterString && isNotCurrentDoc && !isRelatedToCurrentDoc
}

// Animate on filter change
const documentGrid = ref<HTMLElement>()
onMounted(() => {
	autoAnimate(documentGrid.value as HTMLElement)
})

//* SELECTION
// Because of issues where selected elements cannot be compared (for some reason)
// we just select docs by their ID and then get the full docs with selected IDs when emitted
const { selected: selectedToRemove, select: selectToRemove } = useSelection<number>()
const { selected: selectedToAdd, select: selectToAdd } = useSelection<number>()

const emit = defineEmits<{
	(e: 'updateRelations', idToUpdate: number, newDocIds: number[]): void
	(e: 'hide'): void
}>()

function updateRelatedDocuments() {
	const existingRelatedDocs = (currentDocument?.related_documents as RelatedDocument[]).map(
		rel => (rel.related_document_id as Document).id
	)
	const withRemoved = existingRelatedDocs.filter(id => !selectedToRemove.value.includes(id))
	const newRelatedDocs = [...withRemoved, ...selectedToAdd.value]

	emit('updateRelations', currentDocument!.id, newRelatedDocs)
}

function reset() {
	selectedToRemove.value = []
	selectedToAdd.value = []
	filterString = ''
	selectedTags = []

	emit('hide')
}
</script>

<style scoped lang="postcss">
.document-grid {
	@apply grid gap-2;

	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
</style>
