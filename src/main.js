'use strict';

//
// YOUR CODE GOES HERE...
//
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
// ░░░░░░░░░░▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄░░░░░░░░░░░
// ░░░░░░░░▄▀░░░░░░░░░░░░▄░░░░░░░▀▄░░░░░░░░
// ░░░░░░░░█░░▄░░░░▄░░░░░░░░░░░░░░█░░░░░░░░
// ░░░░░░░░█░░░░░░░░░░░░▄█▄▄░░▄░░░█░▄▄▄░░░░
// ░▄▄▄▄▄░░█░░░░░░▀░░░░▀█░░▀▄░░░░░█▀▀░██░░░
// ░██▄▀██▄█░░░▄░░░░░░░██░░░░▀▀▀▀▀░░░░██░░░
// ░░▀██▄▀██░░░░░░░░▀░██▀░░░░░░░░░░░░░▀██░░
// ░░░░▀████░▀░░░░▄░░░██░░░▄█░░░░▄░▄█░░██░░
// ░░░░░░░▀█░░░░▄░░░░░██░░░░▄░░░▄░░▄░░░██░░
// ░░░░░░░▄█▄░░░░░░░░░░░▀▄░░▀▀▀▀▀▀▀▀░░▄▀░░░
// ░░░░░░█▀▀█████████▀▀▀▀████████████▀░░░░░░
// ░░░░░░████▀░░███▀░░░░░░▀███░░▀██▀░░░░░░░
// ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
//
// Nyan cat lies here...
//

'use strict';

const WebSocket = require('ws');
const LifeGameVirtualDom = require('../lib/LifeGameVirtualDom');

const wss = new WebSocket.Server({
	port: 1919,
	verifyClient
});

const vd = new LifeGameVirtualDom();

vd.sendUpdates = data => {
	wss.clients.forEach(client => {
		if (client.readyState === WebSocket.OPEN) {
			sendResp(client, 'UPDATE_STATE', data);
		}
	});
};

wss.on('connection', (ws, req) => {
	const user = getUser(req);

	if (!user) {
		ws.terminate();
		return;
	}

	const currentVDState = vd.state;
	const currentVDSettings = vd.settings;

	sendResp(ws, 'INITIALIZE', {
		state: currentVDState,
		settings: currentVDSettings,
		user
	});

	ws.on('message', mess => {
		const data = JSON.parse(mess);
		processMessage(data);
	});
});

function processMessage({type, data}) {
	switch (type) {
		case 'ADD_POINT':
			vd.applyUpdates(data);
			break;
		default:
			console.log(`Undefined message type - ${type} with data - ${data}`);
			break;
	}
}

function sendResp(ws, type, data) {
	const result = JSON.stringify({
		type,
		data
	});

	ws.send(result);
}

function verifyClient(info) {
	const url = info.req.url;
	const params = getUrlParams(url);

	if (!params.token) {
		return false;
	}

	info.req.token = params.token;
	return true;
}

function getUrlParams(url) {
	return url.slice(2).split('&').reduce((prev, curr) => {
		const a = curr.split('=');
		if (!a[0]) return prev;

		prev[a[0]] = a[1];
		return prev;
	}, {});
}

function getUser({token}) {
	let user = {};

	if (!token) {
		return false;
	}

	user.token = token;
	user.color = getRandomColor();

	return user;
}

function getRandomColor() {
	var letters = '0123456789ABCDEF';
	var color = '#';
	for (var i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}
