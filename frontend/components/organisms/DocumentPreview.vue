<template>
	<button class="card">
		<div class="card-body w-full">
			<h2 class="card-title inline">{{ document.title }}</h2>
			<div class="divider my-0" />

			<!-- MUST use a wrapper to get v-once working correctly with :content so quill does not keep failing updates
		when searching which calls a diff check that fails -->
			<QuillReadOnly :content="new Delta(document.content as any)" />

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
							:avatar-options="{ key: 'user-badge' }"
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
} from '@/types/directus'

const { document } = defineProps<{
	document: Document
}>()
</script>
