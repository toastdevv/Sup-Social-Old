let messageForm = document.getElementById('message-form');
let messageField = document.getElementById('message-field');

let messagesContainer = document.getElementById('messages-container');

let locTemp = window.location.href.split('/');

let ccId = locTemp[locTemp.length - 2];
let roomId = locTemp[locTemp.length - 1];

/*global io*/
const socket = io();

socket.emit('room join', { cc_id: ccId, room_id: roomId });

function addMessage(message) {
	let messageDiv = document.createElement('div');
	messageDiv.classList.add('message');

	let messageText = document.createElement('p');
	messageText.style.fontSize = '1.3em';
	messageText.innerText = message.username + ': ' + message.message;

	messageDiv.appendChild(messageText);

	messagesContainer.appendChild(messageDiv);

	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener('DOMContentLoaded', async e => {
	let messagesReq = await fetch('/community/centers/rooms/' + ccId + '/' + roomId + '/messages/get', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	let messages = await messagesReq.json();

	console.log(messages);

	messages.forEach(message => {
		addMessage(message);
	})
});

messageForm.addEventListener('submit', async e => {
	e.preventDefault();

	let message = '' + messageField.value;

	messageField.value = '';


	socket.emit('room message', { message: message, cc_id: ccId, room_id: roomId });
});

socket.on('room message', message => {
	addMessage(message);
});