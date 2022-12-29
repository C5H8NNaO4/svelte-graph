export const AddNode = (node) => {
	return {
		type: 'addNode',
		node
	};
};

export const HydrateNodes = (nodes) => {
	return {
		type: 'hydrateNodes',
		nodes
	};
};

export const HydrateLinks = (links) => {
	return {
		type: 'hydrateLinks',
		links
	};
};
