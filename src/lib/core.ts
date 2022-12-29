export const saveToLocalStorage = ({ notes, nodes, links }) => {
	if (localStorage.notes !== JSON.stringify(notes)) {
		localStorage.notes = JSON.stringify(notes);
	}
	localStorage.nodes = JSON.stringify(nodes);
	localStorage.links = JSON.stringify(
		links.map(({ id, source, target, strength }) => ({
			id,
			source: source.id || source,
			target: target.id || target,
			strength
		}))
	);
};

export const loadFromLocalStorage = () => {
	notes = JSON.parse(localStorage.notes);
	baseLinks = JSON.parse(localStorage.links);
	links = [...baseLinks];
	baseNodes = JSON.parse(localStorage.nodes);
	nodes = [...baseNodes];
    return {nodes, links, notes}
};
