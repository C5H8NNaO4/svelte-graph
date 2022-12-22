"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var ws_1 = __importDefault(require("ws"));
var app = (0, express_1["default"])();
var stages = ['on radar', 'trying out', 'using', 'mastered'];
var categories = ['frameworks', 'technologies', 'languages'];
var nodes = __spreadArray(__spreadArray([], categories.map(function (category, index) { return ({
    id: category,
    group: index,
    label: category,
    level: 2
}); }), true), stages.map(function (stage, index) { return ({
    id: stage,
    group: categories.length + index,
    label: stage,
    level: 1
}); }), true);
var links = [];
var notes = {};
var wss = new ws_1["default"].Server({
    noServer: true
});
wss.broadcast = function broadcast(msg, except) {
    console.log(msg);
    wss.clients.forEach(function each(client) {
        if (client !== except)
            client.send(msg);
    });
};
wss.on('connection', function (socket) {
    socket.on('message', function (message) {
        var _a, _b, _c, _d;
        var str = message.toString();
        console.log(str);
        var json = JSON.parse(str);
        var action = json.action;
        switch (action) {
            case 'add':
                nodes.push(json.value);
                (_a = wss.broadcast) === null || _a === void 0 ? void 0 : _a.call(wss, JSON.stringify({ action: 'add', value: json.value }), socket);
                break;
            case 'link':
                links.push(json.value);
                (_b = wss.broadcast) === null || _b === void 0 ? void 0 : _b.call(wss, JSON.stringify({ action: 'link', value: json.value }), socket);
                break;
            case 'save':
                var _e = json.value, n = _e.nodes, l = _e.links, m = _e.notes;
                nodes = n;
                links = l;
                notes = m;
                (_c = wss.broadcast) === null || _c === void 0 ? void 0 : _c.call(wss, JSON.stringify({ action: 'get', value: { notes: notes, links: links, nodes: nodes } }), socket);
                break;
            case 'get':
                (_d = socket.send) === null || _d === void 0 ? void 0 : _d.call(socket, JSON.stringify({ action: 'get', value: { notes: notes, links: links, nodes: nodes } }));
                break;
        }
    });
});
// `server` is a vanilla Node.js HTTP server, so use
// the same ws upgrade process described here:
// https://www.npmjs.com/package/ws#multiple-servers-sharing-a-single-https-server
var server = app.listen(3214);
server.on('upgrade', function (request, socket, head) {
    wss.handleUpgrade(request, socket, head, function (socket) {
        wss.emit('connection', socket, request);
    });
});
//# sourceMappingURL=index.js.map