let messageForm = document.getElementById('message-form');
let messageField = document.getElementById('message-field');

let messagesContainer = document.getElementById('messages-container');

let locTemp = window.location.href.split('/');

let dmName = locTemp[locTemp.length - 1];

console.log(dmName);

/*global io*/
const socket = io();

socket.emit('join', { dmName });

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
	let messagesReq = await fetch('/messages/get/' + dmName, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	let messages = await messagesReq.json();

	messages.forEach(message => {
		addMessage(message);
	})
});

messageForm.addEventListener('submit', async e => {
	e.preventDefault();

	let message = '' + messageField.value;

	messageField.value = '';


	socket.emit('chat message', { message: message, dmName: dmName });
});

socket.on('chat message', message => {
	addMessage(message);
});