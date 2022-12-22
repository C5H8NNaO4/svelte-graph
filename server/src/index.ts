import express from 'express';
import ws from 'ws';

const app = express();

const stages = ['on radar', 'trying out', 'using', 'mastered'];
const categories = ['frameworks', 'technologies', 'languages'];

let nodes = [
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
];

let links: Record<string, any>[] = [];
let notes = {};

let wss: ws.Server<ws.WebSocket> & { broadcast?: (msg: string, except?: any) => void } =
	new ws.Server({
		noServer: true
	});
wss.broadcast = function broadcast(msg, except) {
	console.log(msg);
	wss.clients.forEach(function each(client) {
		if (client !== except) client.send(msg);
	});
};
wss.on('connection', (socket) => {
	socket.on('message', (message) => {
		const str = message.toString();
		console.log(str);
		const json = JSON.parse(str);

		const { action } = json;

		switch (action) {
			case 'add':
				nodes.push(json.value);
				wss.broadcast?.(JSON.stringify({ action: 'add', value: json.value }), socket);
				break;
			case 'link':
				links.push(json.value);
				wss.broadcast?.(JSON.stringify({ action: 'link', value: json.value }), socket);
				break;
			case 'save':
				const { nodes: n, links: l, notes: m } = json.value;
				nodes = n;
				links = l;
				notes = m;
				wss.broadcast?.(JSON.stringify({ action: 'get', value: { notes, links, nodes } }), socket);
				break;
			case 'get':
				socket.send?.(JSON.stringify({ action: 'get', value: { notes, links, nodes } }));
				break;
		}
	});
});

// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
const server = app.listen(3214);
server.on('upgrade', (request, socket, head) => {
	wss.handleUpgrade(request, socket, head, (socket) => {
		wss.emit('connection', socket, request);
	});
});
