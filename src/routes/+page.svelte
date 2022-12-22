<script lang="ts">
	import Header from '../components/Header.svelte';
	import Selector from '../components/Categories/Selector.svelte';
	import Categories from '../components/Categories/Categories.svelte';
	//     import * as d3 from 'd3'
	//     import { onMount } from 'svelte';

	//     onMount(() => {
	//         var width = window.innerWidth
	// var height = window.innerHeight
	// // create dummy data -> just one element per circle
	// var data = [{ "name": "A" }, { "name": "B" }, { "name": "C" }, { "name": "D" }, { "name": "E" }, { "name": "F" }, { "name": "G" }, { "name": "H" }]
	// var data3 = [{ "name": "A" }, { "name": "B" }, { "name": "C" }, { "name": "D" }, { "name": "E" }, { "name": "F" }, { "name": "G" }, { "name": "H" }]
	// var data2 = [{name: 'A'},{name: 'B'},{name: 'C'}]

	//         var sampleSVG = d3.select("#viz")
	//         .append("svg")
	//         .attr("width", width)
	//         .attr("height", height);

	//         var circleGroup = sampleSVG.selectAll("g")
	//                           .data(data2)
	//                           .enter()
	//                           .append("g");

	//         var node = circleGroup.selectAll("circle")
	//         .data(data2)
	//         .enter().append("circle")
	//         .style("stroke", "gray")
	//         .style("fill", "transparent")
	//         .attr("r", (d,i) => (i + 1) * 50)
	//         .attr("cx", (d,i) => 100)
	//         // .attr("cx", function(d, i){return 50 + (i*80)})
	//         .attr("cy", 100);

	//         var node2 = circleGroup.selectAll("circle")
	//         .data(data)
	//         .enter().append("circle")
	//         .style("stroke", "gray")
	//         .style("fill", "transparent")
	//         .attr("r", (d,i) => 10)
	//         .attr("cx", (d,i) => 100 )
	//         // .attr("cx", function(d, i){return 50 + (i*80)})
	//         .attr("cy", 100);

	//         var node3 = circleGroup.selectAll("circle")
	//         .data(data3)
	//         .enter().append("circle")
	//         .style("stroke", "gray")
	//         .style("fill", "transparent")
	//         .attr("r", (d,i) => 10)
	//         .attr("cx", (d,i) => 100 )
	//         // .attr("cx", function(d, i){return 50 + (i*80)})
	//         .attr("cy", 100);

	//         // Features of the forces applied to the nodes:
	// var simulation = d3.forceSimulation()
	//     .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
	//     .force("charge", d3.forceManyBody().strength(.7)) // Nodes are attracted one each other of value is > 0
	//     .force("collide", d3.forceCollide().strength(.1).radius(10).iterations(1)) // Force that avoids circle overlapping

	// // Apply these forces to the nodes and update their positions.
	// // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
	// simulation
	//     .nodes([...data, ...data2, ...data3])
	//     .on("tick", function(d){
	//       node2
	//           .attr("cx", function(d){ return d.x; })
	//           .attr("cy", function(d){ return d.y; });
	//           node
	//           .attr("cx", function(d){ return d.x; })
	//           .attr("cy", function(d){ return d.y; })
	//     });
	//     })
	enum States {
		using = 'using',
		learning = 'learning',
		interested = 'interested'
	}
	let title = 'Radar';
	let data = [
		{
			title: 'React',
			category: 'Frontend',
			state: States.using,
			value: 10
		},
		{
			title: 'Svelte',
			category: 'Frameworks',
			state: States.learning,
			value: 10
		},
		{
			title: 'Vue',
			category: 'Misc',
			value: 10,
			state: States.interested
		}
	];

	const categories = [...new Set(data.map((d) => d.category))];
	const states = [...new Set(data.map((d) => d.state || States.interested))];

	const selected = new Set();
	let selectedArr = [...selected];
	const onSelect = (e, entry) => {
		selected.has(entry) ? selected.delete(entry) : selected.add(entry);
		selectedArr = [...selected];
	};
</script>

<main>
	<div class="main">
		<Header {title} />
		<Selector {categories} onChange={onSelect} />
		<Categories categories={selectedArr} {data} />
		<div class="container">
			{#each states as state}
				{state}
				<div class="state">
					{#each categories as cat}
						<div>
							{cat}
							<div class="cat">
								{#each data.filter((e) => e.state === state && e.category === cat) as entry}
									<div>{entry.title}</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/each}
		</div>
	</div>
</main>

<style>
	.cat {
		display: flex;
		flex-direction: column;
		justify-content: space-evenly;
		background-color: aquamarine;
	}
	.state {
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		border: 1px solid;
	}
	.container {
		height: calc(100vh - 48px);
	}
	.container .state:nth-child(1) {
		height: 50%;
	}
	.container .state:nth-child(2) {
		height: 25%;
	}
	.container .state:nth-child(3) {
		height: 12.5%;
	}
</style>
