export const useReducer = (() => {
	let state;
	return (
		reducer,
		initialState
	): (() => [typeof initialState, (state, action) => typeof initialState]) => {
		state = initialState;
		const dispatch = (action) => {
			state = reducer(state, action);
			return state;
		};
		return [state, dispatch];
	};
})();

export const stages = ['on radar', 'trying out', 'using', 'mastered'];
export const categories = ['frameworks', 'technologies', 'languages'];
export const initialState = {
	nodes: [
		...categories.map((category, index) => ({
			id: category,
			group: index,
			label: category,
			level: 2
		})),
		...stages.map((stage, index) => ({
			id: stage,
			group: categories.length + index,
			label: stage,
			level: 1
		}))
	],
	links: [],
	notes: {}
};

export const notesReducer = (state, action) => {
	switch (action.type) {
		case 'hydrateNotes':
			return { ...state, notes: action.notes };
		case 'addNote':
			return { ...state, notes: { ...state.notes, [action.id]: action.note } };
		case 'deleteNote':
			const { [action.id]: _, ...notes } = state.notes;
			return { ...state, notes };
		default:
			return state;
	}
};

export const linksReducer = (state, action) => {
	switch (action.type) {
		case 'hydrateLinks':
			return { ...state, links: action.links };
		case 'addLink':
			return { ...state, links: [...state.links, action.link] };
		case 'deleteLink':
			return { ...state, links: state.links.filter(({ id }) => id !== action.id) };
		default:
			return state;
	}
};

export const nodesReducer = (state, action) => {
	switch (action.type) {
		case 'hydrateNodes':
			return { ...state, nodes: action.nodes };
		case 'addNode':
			return { ...state, nodes: [...state.nodes, action.node] };
		case 'deleteNode':
			return { ...state, nodes: state.nodes.filter(({ id }) => id !== action.id) };
		default:
			return state;
	}
};

export const compose =
	(...reducers) =>
	(state, action) => {
		return reducers.reduce((state, reducer) => reducer(state, action), state);
	};

export const reducer = compose(notesReducer, linksReducer, nodesReducer);
