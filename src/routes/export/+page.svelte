<script>
	import Header from '../../components/Header.svelte';
	import { prettyPrintJson } from 'pretty-print-json';
	import { onMount } from 'svelte';
	import saveFile from 'save-as-file';
	import { openFile } from '$lib/util';
	let notes = typeof localStorage === 'undefined' ? {} : JSON.parse(localStorage.notes || '{}');
	let nodes = [];
	let links = [];
	onMount(() => {
		notes = JSON.parse(localStorage.notes || '{}');
		nodes = JSON.parse(localStorage.nodes || '[]');
		links = JSON.parse(localStorage.links || '[]');
	});

	const save = (content, name) => {
		const json = JSON.stringify(content);
		const file = new File([json], { type: 'application/json' });
		saveFile(file, name);
	};
</script>

<main>
	<Header title="Export" />
	<div class="actions">
		<span class="grow" />
		Export
		<div
			class={'button'}
			on:click={() => {
				openFile((content) => {
					const data = JSON.parse(content);
					for (const key in data) {
						localStorage[key] = JSON.stringify(data[key]);
					}
				});
			}}
		>
			<span class="material-icons">upload</span>
			Import
		</div>
		<div class={'button'} on:click={save({ notes, nodes, links }, 'notes.json')}>
			<span class="material-icons">download</span>
			Save
		</div>
	</div>
	<pre>
        <code>
            {@html prettyPrintJson.toHtml({ notes, nodes, links })}
        </code>
    </pre>
</main>

<style>
	.actions {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px 8px;
	}
	.actions > span {
		margin-left: auto;
	}
	.button {
		margin: 8px;
		cursor: pointer;
		box-shadow: 0px 0px 10px #00000022;
		display: flex;
		border-radius: 100px;
		line-height: 24px;
		padding: 4px 8px;
	}
	.button:not(.disabled):hover {
		box-shadow: 0px 0px 10px #00000044;
	}
	.button:active {
		box-shadow: 0px 0px 5px #00000044;
	}
</style>
