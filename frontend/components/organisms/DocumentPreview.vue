<template>
	<button class="card">
		<div class="card-body w-full relative">
			<!-- PRIVATE DOC INDICATOR -->
			<div
				v-if="document.private"
				class="absolute top-0 left-0 h-0 w-0 rounded-tl-2xl border-t-[4rem] border-r-[4rem] border-t-base-300 border-r-transparent"
			>
				<div
					class="absolute -top-[52px] left-3 tooltip tooltip-right z-20"
					data-tip="Only you can see this document"
				>
					<Icon class="text-xl optical-size-40 grade-100 text-muted">lock</Icon>
				</div>
			</div>
			<!-- RELATED FILES INDICATOR -->
			<div
				v-if="document.related_files?.length"
				class="absolute top-0 right-0 h-0 w-0 rounded-tr-2xl border-t-[4rem] border-l-[4rem] border-t-base-300 border-l-transparent"
			>
				<div
					class="absolute -top-[52px] right-3 tooltip tooltip-left z-20"
					:data-tip="relatedFilesText"
				>
					<Icon class="text-xl optical-size-40 grade-100 text-secondary">attach_file</Icon>
				</div>
			</div>

			<h2 class="card-title inline z-10">{{ document.title }}</h2>
			<div class="divider my-0" />

			<!-- MUST use a wrapper to get v-once working correctly with :content so quill does not keep failing updates
			when searching which calls a diff check that fails -->
			<!-- <QuillReadOnly :content="new Delta(document.content as any)" /> -->
			<QuillReadOnly :content="(document.content as Delta)" />

			<div class="card-actions grid items-center grid-cols-[1fr_auto]">
				<!-- TAGS -->
				<div class="flex flex-wrap gap-2">
					<span
						v-for="tag of (document.tags as DocumentTag[])"
						:key="tag.id"
						class="badge badge-outline badge-secondary"
						>{{ (tag.tags_id as Tag)?.name }}</span
					>
				</div>
				<!-- SUBSCRIBERS -->
				<div
					class="tooltip tooltip-bottom"
					:data-tip="'Subscribers: ' + 
					new Intl.ListFormat('en', { style: 'long', type: 'conjunction' }).format((document.subscribers as DocumentSubscriber[]).map(sub => (sub.directus_users_id as DirectusUser)).map(({ first_name, last_name }) =>
						[first_name, last_name].filter(name => name).join(' ')
					))
				"
				>
					<div class="avatar-group -space-x-5 cursor-default self-end">
						<Avatar
							v-for="sub of (document.subscribers as DocumentSubscriber[])"
							:key="sub.id"
							:user="(sub.directus_users_id as Partial<DirectusUser>)"
							:avatar-options="{ key: 'user-avatar' }"
							class="w-8 text-sm"
							avatar-class="border-2 border-secondary"
						/>
					</div>
				</div>
			</div>
		</div>
	</button>
</template>

<script setup lang="ts">
import { Delta } from '@vueup/vue-quill'
import type {
	Documents as Document,
	Tags as Tag,
	DocumentsTags as DocumentTag,
	DocumentsDirectusUsers as DocumentSubscriber,
	DirectusUsers as DirectusUser,
	DirectusFiles as File,
	DocumentsRelatedFiles as RelatedFile,
} from '@/types/directus'

const { document } = defineProps<{
	document: Document
}>()

const relatedFilesText = $computed<string>(() => {
	const fileNames = (document.related_files as RelatedFile[]).map(
		rel => (rel.file_id as File).filename_download
	)

	return new Intl.ListFormat('en', { style: 'short', type: 'conjunction' }).format(fileNames)
})
</script>
