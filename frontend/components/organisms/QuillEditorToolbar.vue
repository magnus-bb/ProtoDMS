<template>
	<div>
		<span class="ql-formats">
			<button class="ql-bold" />
			<button class="ql-italic" />
			<button class="ql-underline" />
			<button class="ql-strike" />
		</span>
		<span class="ql-formats">
			<button class="ql-blockquote" />
			<button class="ql-code-block" />
		</span>
		<span class="ql-formats">
			<select class="ql-header">
				<option value="1" />
				<option value="2" />
				<option value="3" />
				<option value="4" />
				<option value="5" />
				<option value="6" />
				<option />
			</select>
		</span>
		<span class="ql-formats">
			<button class="ql-list" value="ordered" />
			<button class="ql-list" value="bullet" />
		</span>
		<span class="ql-formats">
			<button class="ql-indent" value="+1" />
			<button class="ql-indent" value="-1" />
		</span>
		<span class="ql-formats">
			<select class="ql-color">
				<option />
				<option value="#000000" />
				<option value="#e60000" />
				<option value="#ff9900" />
				<option value="#ffff00" />
				<option value="#008a00" />
				<option value="#0066cc" />
				<option value="#9933ff" />
				<option value="#ffffff" />
				<option value="#facccc" />
				<option value="#ffebcc" />
				<option value="#ffffcc" />
				<option value="#cce8cc" />
				<option value="#cce0f5" />
				<option value="#ebd6ff" />
				<option value="#bbbbbb" />
				<option value="#f06666" />
				<option value="#ffc266" />
				<option value="#ffff66" />
				<option value="#66b966" />
				<option value="#66a3e0" />
				<option value="#c285ff" />
				<option value="#888888" />
				<option value="#a10000" />
				<option value="#b26b00" />
				<option value="#b2b200" />
				<option value="#006100" />
				<option value="#0047b2" />
				<option value="#6b24b2" />
				<option value="#444444" />
				<option value="#5c0000" />
				<option value="#663d00" />
				<option value="#666600" />
				<option value="#003700" />
				<option value="#002966" />
				<option value="#3d1466" />
			</select>
			<select class="ql-background">
				<option />
				<option value="#000000" />
				<option value="#e60000" />
				<option value="#ff9900" />
				<option value="#ffff00" />
				<option value="#008a00" />
				<option value="#0066cc" />
				<option value="#9933ff" />
				<option value="#ffffff" />
				<option value="#facccc" />
				<option value="#ffebcc" />
				<option value="#ffffcc" />
				<option value="#cce8cc" />
				<option value="#cce0f5" />
				<option value="#ebd6ff" />
				<option value="#bbbbbb" />
				<option value="#f06666" />
				<option value="#ffc266" />
				<option value="#ffff66" />
				<option value="#66b966" />
				<option value="#66a3e0" />
				<option value="#c285ff" />
				<option value="#888888" />
				<option value="#a10000" />
				<option value="#b26b00" />
				<option value="#b2b200" />
				<option value="#006100" />
				<option value="#0047b2" />
				<option value="#6b24b2" />
				<option value="#444444" />
				<option value="#5c0000" />
				<option value="#663d00" />
				<option value="#666600" />
				<option value="#003700" />
				<option value="#002966" />
				<option value="#3d1466" />
			</select>
		</span>
		<span class="ql-formats">
			<select class="ql-font">
				<option />
				<option value="serif" />
				<option value="monospace" />
			</select>
		</span>
		<span class="ql-formats">
			<select class="ql-align">
				<option />
				<option value="center" />
				<option value="right" />
				<option value="justify" />
			</select>
		</span>
		<span class="ql-formats">
			<button class="ql-link" />
			<button class="ql-video" />
			<button class="ql-image" />
			<!-- TODO link to file from directus -->
			<!-- <button class="ql-directus-select-or-upload-file">
				<Icon class="grade-200">description</Icon>
			</button> -->
			<div
				class="px-2 tooltip tooltip-bottom"
				data-tip="Type @, :person, :file, or :document to link to other resources."
			>
				<Icon class="text-sm">question_mark</Icon>
			</div>
		</span>
		<span class="ql-formats">
			<button class="ql-clean" />
		</span>
	</div>
</template>

<script setup lang="ts"></script>
