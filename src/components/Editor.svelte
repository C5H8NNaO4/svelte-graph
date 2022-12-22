<script lang="ts">
	import Editor from '@tinymce/tinymce-svelte';
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	export let value;
	const test = writable({});
	test.subscribe(() => {
		console.log('NOTES CHANGED!!!');
	});
</script>

<main>
	<Editor
		on:keyup
		cssClass="editor"
		bind:value
		apiKey="v17dzisese85jj35ras5gcg5mg363j0nzk8a8wjyzqda7fvk"
		conf={{
			plugins: ['link', 'markdown']
		}}
		modelEvents="change"
	/>
</main>

<style>
	.editor {
		height: 100%;
	}
</style>
