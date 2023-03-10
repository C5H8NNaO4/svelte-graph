<script lang="ts">
	import * as d3 from 'd3';
	import Editor from '../components/Editor.svelte';
	import { afterUpdate, onMount, beforeUpdate } from 'svelte';
	import Header from '../components/Header.svelte';
	import Button from '../components/Button.svelte';
	import {
		getLinkColor,
		getNeighbors,
		getNodeColor,
		getTextColor,
		openFile,
		saveToFile
	} from '$lib/util';
	import { saveToLocalStorage } from '$lib/core';
	import { initialState, reducer, stages, useReducer } from '$lib/state';
	import { HydrateLinks, HydrateNodes } from '$lib/actions';
	import Color from 'color';

	const connColors = ['yellow', 'green', 'yellow', 'red'];
	// Get the value out of storage on load.
	let notes = typeof localStorage == 'undefined' ? {} : JSON.parse(localStorage.notes || '{}');
	let r = 0;
	let [state, dispatch] = useReducer(reducer, initialState);

	let baseNodes = state.nodes;
	let baseLinks = state.links;
	let links = [...baseLinks];
	let nodes = [...baseNodes];
	let readyState = -1;

	let update, group, selectNode, zoom, textGroup, simulation;
	let g_selectedNode;
	let width;
	let linkElements, nodeElements, textElements;

	const resetData = () => {
		nodes = [...baseNodes];
		links = [...baseLinks];
	};

	onMount(() => {
		if (localStorage.nodes) {
			state = dispatch(HydrateNodes(JSON.parse(localStorage.nodes)));
			state = dispatch(HydrateLinks(JSON.parse(localStorage.links)));
			baseNodes = state.nodes;
			baseLinks = state.links;
			resetData?.();
			update?.();
		}
	});

	const onStateChange = (newState) => {
		baseNodes = state.nodes;
		baseLinks = state.links;
		resetData?.();
		update?.();
	};

	$: {
		onStateChange(state);
	}
	onMount(() => {
		const height = window.innerHeight;
		width = window.innerWidth;

		const svg = d3.select('svg');
		const g = svg.append('g');
		svg.attr('width', width).attr('height', height - 66);

		const linkGroup = g.append('g').attr('class', 'links');
		const nodeGroup = g.append('g').attr('class', 'nodes');
		textGroup = g.append('g').attr('class', 'texts');

		const linkForce = d3
			.forceLink()
			.id((link) => link.id)
			.strength((link) => link.strength || 0);

		simulation = d3
			.forceSimulation()
			.force('link', linkForce)
			.force('charge', d3.forceManyBody().strength(1))
			.force(
				'center',
				d3
					.forceCenter()
					.x(width / 2)
					.y(height / 2)
					.strength(1)
			)
			.force('collide', d3.forceCollide().strength(0.1).radius(50).iterations(1)); // Force that avoids circle overlapping

		simulation.alphaTarget(0);

		zoom = d3
			.zoom()
			.scaleExtent([1 / 4, 8])
			.on('zoom', function (e) {
				g.attr('transform', e.transform);
			});
		svg.call(zoom);

		const dragDrop = d3
			.drag()
			.on('start', (node) => {
				node.fx = node.x;
				node.fy = node.y;
				simulation.force('center', d3.forceCenter().strength(0));
			})
			.on('drag', (e, node) => {
				simulation.alphaTarget(0.4).restart();
				node.fx = e.x;
				node.fy = e.y;
			})
			.on('end', (e, node) => {
				console.log('End');
				if (!node.active) {
					simulation.alphaTarget(0);
				}
				delete node.fx;
				delete node.fy;
				updateSimulation();
			});

		selectNode = (e, selectedNode) => {
			if (g_selectedNode?.id === selectedNode.id) {
				g_selectedNode = undefined;
				cat = selectedNode.id;
				width = window.innerWidth;
				d3.select('svg').attr('width', width).attr('height', height);
				simulation.force(
					'center',
					d3
						.forceCenter()
						.x(width / 2)
						.y((height - 64) / 2)
						.strength(0.8)
				);
				resetData();
				updateSimulation();

				simulation.force('center', d3.forceCenter().strength(0));
			} else {
				width = window.innerWidth - 350;
				cat = selectedNode.id;

				d3.select('svg').attr('width', width).attr('height', height);
				let sel = baseNodes.find((n) => n.id === selectedNode.id);
				if (typeof notes[sel.id] === 'undefined') {
					notes[sel.id] = 'Add your notes here...';
				}
				g_selectedNode = sel;
				updateData(selectedNode);
				updateSimulation();
				simulation.force(
					'center',
					d3
						.forceCenter()
						.x(width / 2)
						.y((height - 64) / 2)
						.strength(0.8)
				);
			}

			const neighbors = getNeighbors(selectedNode, baseLinks);

			// we modify the styles to highlight selected nodes
			nodeElements.attr('fill', (node) => getNodeColor(node, getNeighbors(node, baseLinks), nodes));
			textElements.attr('fill', (node) => getTextColor(node, neighbors));
			linkElements.attr('stroke', (link) => getLinkColor(selectedNode, link));

			d3.select('svg')
				.attr('width', width)
				.attr('height', window.innerHeight - 66);
		};

		const hoverNode = (e, selectedNode) => {
			const neighbors = getNeighbors(selectedNode, baseLinks);

			// we modify the styles to highlight selected nodes
			nodeElements
				.attr('fill', (node) =>
					node.id !== selectedNode.id
						? getNodeColor(node, getNeighbors(node, baseLinks), nodes)
						: Color(getNodeColor(node, getNeighbors(node, baseLinks), nodes)).alpha(0.8)
				)
				.attr(
					'r',
					(node) =>
						(node.id === selectedNode.id ? 10 : 5) +
						getNeighbors(node, links)?.length * (2 / node.level)
				)
				.attr('class', 'node hover')
				.attr('stroke', 'black')
				.attr('stroke-width', (n) => (n.id === selectedNode.id ? '2px' : '1px'));

			linkElements.attr('stroke', (link) => getLinkColor(selectedNode, link));
		};
		const leaveNode = (e, selectedNode) => {
			nodeElements
				.attr('fill', (node) => getNodeColor(node, getNeighbors(node, baseLinks), nodes))
				.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
				.attr('class', 'node')
				.attr('stroke', 'black')
				.attr('stroke-width', '1px');

			linkElements.attr('stroke', (link) => '#E5E5E5');
		};

		function updateData(selectedNode) {
			const neighbors = getNeighbors(selectedNode, baseLinks);
			const newNodes = baseNodes.filter(
				(node) => node.id === selectedNode.id || neighbors.includes(node.id)
			);

			console.log('NEWNODES', selectedNode, baseLinks, getNeighbors(baseNodes[0], baseLinks));
			const diff = {
				removed: nodes.filter((node) => newNodes.indexOf(node) === -1),
				added: newNodes.filter((node) => nodes.indexOf(node) === -1)
			};

			diff.removed.forEach((node) => nodes.splice(nodes.indexOf(node), 1));
			diff.added.forEach((node) => nodes.push(node));

			links = baseLinks.filter(
				(link) => link.target.id === selectedNode.id || link.source.id === selectedNode.id
			);
		}

		function updateGraph() {
			linkElements = linkGroup
				.selectAll('line')
				.data(links, (link) => link.target.id + link.source.id);
			linkElements.exit().remove();

			const linkEnter = linkElements
				.enter()
				.append('line')
				.attr('stroke-width', (l) => l.strength * 6)
				.attr('stroke', 'rgba(50, 50, 50, 0.2)');

			linkElements = linkEnter.merge(linkElements);

			nodeElements = nodeGroup.selectAll('circle').data(nodes, (node) => node.id);
			nodeElements.exit().remove();

			const nodeEnter = nodeElements
				.enter()
				.append('circle')
				.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
				.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
				.attr('stroke', 'black')
				.call(dragDrop)
				.on('click', selectNode)
				.on('mouseover', hoverNode)
				.on('mouseout', leaveNode);

			nodeElements = nodeEnter.merge(nodeElements);
			textElements = textGroup.selectAll('text').data(nodes, (node) => node.id);
			textElements.exit().remove();

			const textEnter = textElements
				.enter()
				.append('text')
				.text((node) => node.label)
				.attr('font-size', 15)
				.attr('dx', 15)
				.attr('dy', 4);

			textElements = textEnter.merge(textElements);
		}

		function updateSimulation() {
			updateGraph();

			simulation.nodes(nodes).on('tick', () => {
				nodeElements.attr('cx', (node) => node.x).attr('cy', (node) => node.y);
				textElements.attr('x', (node) => node.x).attr('y', (node) => node.y);
				linkElements
					.attr('x1', (link) => link.source.x)
					.attr('y1', (link) => link.source.y)
					.attr('x2', (link) => link.target.x)
					.attr('y2', (link) => link.target.y);
			});

			// simulation.force(
			// 	'center',
			// 	d3
			// 		.forceCenter()
			// 		.x(width / 2)
			// 		.y((height - 64) / 2)
			// 		.strength(0.8)
			// );
			simulation.force('link').links(links).strength(0.1);
			simulation.alphaTarget(0.7).restart();
			setTimeout(() => {
				simulation.alphaTarget(0);
			}, 0);
		}

		updateSimulation();

		update = () => {
			simulation.alphaTarget(0.1).restart();

			updateGraph();
			updateSimulation();
			setTimeout(() => {
				simulation.alphaTarget(0);
			}, 0);
		};
		group = nodeGroup;
	});

	let cat = stages[0];
	let name = 'Svelte';
	let socket;
	const connect = () => {
		socket = new WebSocket(
			prompt(
				'url',
				process.env.NODE_ENV !== 'production'
					? 'ws://localhost:3214'
					: 'wss://graph.state-less.cloud'
			)
		);
		readyState = 0;
		socket.onclose = () => {
			readyState = 3;
			socket = null;
		};
		socket.onopen = () => {
			console.log('Connection established!');
			readyState = 1;
		};
		socket.onerror = (e) => {
			console.log('Error', e);
			readyState = 3;
			socket = null;
		};
		socket.onmessage = (e) => {
			const data = JSON.parse(e.data);
			if (data.action === 'get') {
				const { nodes: nod, links: l, notes: n } = data.value;
				baseNodes = nod;
				baseLinks = [
					...l.map(({ target, source, strength }) => ({
						target: target,
						source: source,
						strength
					}))
				];
				nodes = [...baseNodes];
				notes = n;
				links = [...baseLinks];
				resetData();
				update();
				group
					.selectAll('circle')
					.data(nodes, (node) => node.id)
					.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
					.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
					.attr('stroke', 'black');
				// window.links = links;
			}

			if (data.action === 'add') {
				const { value } = data;
				baseNodes.push(value);
				nodes = [...baseNodes];
				update();
				group
					.selectAll('circle')
					.data(nodes, (node) => node.id)
					.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
					.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links)))
					.attr('stroke', 'black');
				simulation.alphaTarget(1).restart();

				setTimeout(() => simulation.alphaTarget(0), 100);
			}

			if (data.action === 'link') {
				const { value } = data;
				baseLinks = [
					...baseLinks.map(({ target, source, strength }) => ({
						target: target.id,
						source: source.id,
						strength
					})),
					value
				];
				links = [...baseLinks];
				update();
				group
					.selectAll('circle')
					.data(nodes, (node) => node.id)
					.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
					.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
					.attr('stroke', 'black');
			}
		};
	};
	const add = () => {
		if (!baseNodes.find((n) => n.id === cat)) {
			const node = { id: cat, label: cat, level: 2 };
			baseNodes.push(node);
			nodes.push(node);
		}
		if (!baseNodes.find((n) => n.id === name)) {
			const node = { id: name, label: name, level: 3 };
			baseNodes.push(node);
			nodes.push(node);
			socket?.send?.(
				JSON.stringify({
					action: 'add',
					value: node
				})
			);
		} else {
			nodes.push(baseNodes.find((n) => n.id === name));
		}
		const link = { target: name, source: cat, strength: 0.1 };
		baseLinks.push(link);
		links.push(link);
		socket?.send?.(
			JSON.stringify({
				action: 'link',
				value: link
			})
		);
		if (socket?.readyState !== 1) {
			saveToLocalStorage({ notes, nodes, links });
		}
		// nodes = [...baseNodes];
		// links = [...baseLinks];

		canDelete = !!links.find(
			(l) => (l.target === name && l.source === cat) || (l.target === cat && l.source === name)
		);
		update();
		group
			.selectAll('circle')
			.data(nodes, (node) => node.id)
			.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
			.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
			.attr('stroke', 'black');
	};

	const remove = () => {
		console.log(
			'Remove',
			name,
			cat,
			baseLinks.findIndex((l) => l.target.id === name && l.source.id === cat)
		);
		baseLinks.splice(
			baseLinks.findIndex((l) => l.target.id === name && l.source.id === cat),
			1
		);
		links = [...baseLinks];
		update();
		group
			.selectAll('circle')
			.data(nodes, (node) => node.id)
			.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
			.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
			.attr('stroke', 'black');
		console.log('Links', links);
		canDelete = !!links.find(
			(l) =>
				(l.target === name && l.source === cat) || (l.target.id === name && l.source.id === cat)
		);
	};

	const upload = () => {
		socket?.send?.(
			JSON.stringify({
				action: 'save',
				value: {
					nodes: baseNodes.map(({ id, label, level, group }) => ({
						id,
						label,
						level,
						group
					})),
					links: baseLinks.map(({ id, source, target, strength }) => ({
						id,
						source: source.id,
						target: target.id,
						strength
					})),
					notes
				}
			})
		);
	};
	const del = () => {
		console.log('Remove', name, cat);
		baseNodes.splice(
			baseNodes.findIndex((l) => l.id === name),
			1
		);
		baseLinks = baseLinks.filter((l) => !(l.target.id === name || l.source.id === name));
		nodes = [...baseNodes];
		links = [...baseLinks];
		if (socket?.readyState !== 1) {
			saveToLocalStorage({ notes, nodes, links });
		}
		group
			.selectAll('circle')
			.data(nodes, (node) => node.id)
			.attr('r', (node) => 5 + getNeighbors(node, links)?.length * (2 / node.level))
			.attr('fill', (node) => getNodeColor(node, getNeighbors(node, links), nodes))
			.attr('stroke', 'black');

		// canDeleteNode = !!nodes.find((l) => l.id === name);
		g_selectedNode = undefined;
		width = window.innerWidth;
		d3.select('svg')
			.attr('width', width)
			.attr('height', window.innerHeight - 66);
		update();
	};
	let canDelete = !!links.find((l) => l.target === name && l.source === cat);
	let canDeleteNode = true;
	let node;

	afterUpdate(() => {});
	beforeUpdate(() => {
		nodeElements?.attr('fill', (node) => getNodeColor(node, getNeighbors(node, baseLinks), nodes));
	});

	let isMenuVisible = false;
	const toggleMenu = () => {
		isMenuVisible = !isMenuVisible;
	};
</script>

<main>
	<Header title="Radar" clsn={g_selectedNode ? 'test' : ''}>
		<div title="Zoom In" class={'button '} on:click={() => zoom.scaleBy(d3.select('svg'), 1.25)}>
			<span class="material-symbols-outlined">add_circle</span>
		</div>
		<div title="Zoom Out" class={'button '} on:click={() => zoom.scaleBy(d3.select('svg'), 0.75)}>
			<span class="material-symbols-outlined">remove_circle</span>
		</div>
		<span class="grow" />

		<select bind:value={cat} disabled={!!g_selectedNode}>
			{#each baseNodes.map((n) => n.id) as cat}
				<option value={cat}>{cat}</option>
			{/each}
		</select>
		<input class="input" type="text" bind:value={name} />
		<span class="grow" />
		<div class={'button'} on:click={add}>
			<span class="material-icons">add</span>
		</div>
		<div class={'button ' + (canDelete ? '' : 'disabled')} on:click={canDelete ? remove : () => {}}>
			<span class="material-icons">remove</span>
		</div>
		<Button title="Menu" iconName="menu" disabled={false} on:click={toggleMenu} />
	</Header>
	<svg id="viz" />
	{#if isMenuVisible}
		<div class={'note dense' + (g_selectedNode ? ' selectedNode' : '')}>
			<div class="flex">
				<Button
					on:click={socket
						? () => {
								notes = JSON.parse(localStorage.notes);
								baseLinks = JSON.parse(localStorage.links);
								links = [...baseLinks];
								baseNodes = JSON.parse(localStorage.nodes);
								nodes = [...baseNodes];
								resetData();
								update();
								socket.close();
								socket = null;
						  }
						: connect}
					clsn={'conn ' + connColors[readyState]}
					iconName="wifi"
				/>
				<span class="grow" />
				<Button clsn="menu" title="Menu" iconName="menu" disabled={false} on:click={toggleMenu} />
			</div>
			<div class="col">
				<Button
					title="Save"
					iconName="save"
					disabled={false}
					on:click={saveToFile({ notes, nodes, links }, 'notes.json')}
				>
					Save
				</Button>
				<Button
					iconName="upload"
					title="Import"
					on:click={() => {
						openFile((content) => {
							const data = JSON.parse(content);
							for (const key in data) {
								localStorage[key] = JSON.stringify(data[key]);
							}
						});
					}}
				>
					Import
				</Button>

				<Button
					iconName="download"
					disabled={!socket}
					on:click={socket
						? () => {
								socket.send(JSON.stringify({ action: 'get' }));
								g_selectedNode = null;
						  }
						: undefined}>Sync</Button
				>
				<Button
					iconName="upload"
					disabled={!socket}
					on:click={socket
						? () => {
								upload();
						  }
						: undefined}>Sync</Button
				>
			</div>
		</div>
	{/if}
	{#if g_selectedNode}
		<div class="note">
			<div class="bar">
				<input bind:value={g_selectedNode.label} />
				<div
					class={'button ' + (canDeleteNode ? '' : 'disabled')}
					on:click={canDeleteNode ? del : () => {}}
					title="Delete this node."
				>
					<span class="material-icons">delete</span>
				</div>
			</div>
			{#key g_selectedNode.id}
				<Editor
					on:keyup={(e, a) => {
						console.log('Keyup', e, a);
						socket?.send?.(
							JSON.stringify({
								action: 'save',
								value: {
									nodes: baseNodes.map(({ id, label, level, group }) => ({
										id,
										label,
										level,
										group
									})),
									links: baseLinks.map(({ id, source, target, strength }) => ({
										id,
										source: source.id,
										target: target.id,
										strength
									})),
									notes: {
										...notes,
										[g_selectedNode.id]: e.detail.editor.getContent()
									}
								}
							})
						);
					}}
					bind:value={notes[g_selectedNode?.id]}
				/>
			{/key}
		</div>
	{/if}
</main>

<style>
	.selectedNode {
		margin-right: 350px;
	}
	.header {
		padding-right: 350px;
	}
	.bar {
		display: flex;
		flex-direction: row;
		padding: 16px 0px;
		border-bottom: 1px solid white;
		margin-bottom: 16px;
		gap: 8px;
		justify-content: space-between;
		width: calc(100% - 48px);
	}
	.bar > input {
		width: 100%;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding-top: 32px;
	}
	:global(.conn) {
		margin-top: 16px;
		margin-left: 32px;
	}
	:global(.menu) {
		margin-top: 16px;
		margin-right: 32px;
	}
	:global(.green) {
		color: green;
	}
	:global(.yellow) {
		color: yellow;
	}
	:global(.red) {
		color: red;
	}
	.flex {
		display: flex;
		flex-direction: row;
		width: 100%;
	}
	input:focus-within,
	select:focus-within {
		outline: none;
	}
	select {
		border: none;
		height: 32px;
		line-height: 32px;

		border-bottom: 1px solid black;
	}
	.input {
		border: none;
		height: 29px;
		line-height: 32px;
		border-bottom: 1px solid black;
	}
	.grow {
		flex-grow: 1;
	}
	.button.disabled {
		cursor: not-allowed;
		box-shadow: 0px 0px 10px #00000022;
		opacity: 0.5;
	}
	.button {
		user-select: none;
		cursor: pointer;
		box-shadow: 0px 0px 10px #00000022;
		display: flex;
		border-radius: 100px;
		padding: 4px;
	}
	.button:not(.disabled):hover {
		box-shadow: 0px 0px 10px #00000044;
	}
	.button:active {
		box-shadow: 0px 0px 5px #00000044 !important;
	}
	.note {
		position: absolute;
		top: 0;
		right: 0;
		width: 350px;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		box-shadow: -4px 0px 10px #00000022;
		color: white;
		display: flex;
		flex-direction: column;
		align-items: center;
		backdrop-filter: blur(4px);
		border-left: 1px solid white;
	}
	.note.dense {
		width: 200px;
		overflow: hidden;
	}
	.note > textarea {
		width: 100%;
		height: 100%;
	}
</style>
