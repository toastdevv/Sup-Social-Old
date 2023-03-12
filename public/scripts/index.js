let getCookieForm = document.getElementById("username-cookie-form");
let usernameField = document.getElementById("username-field");

let messageForm = document.getElementById('message-form');
let messageField = document.getElementById('message-field');

let messagesContainer = document.getElementById('messages-container');

/*global io*/
const socket = io();

function addMessage(message) {
	let messageDiv = document.createElement('div');
	messageDiv.classList.add('message');

	let messageText = document.createElement('p');
	messageText.style.fontSize = '1.3em';
	messageText.innerText = message.username + ': ' + message.message;

	messageDiv.appendChild(messageText);

	messagesContainer.appendChild(messageDiv);
}

document.addEventListener('DOMContentLoaded', async e => {
	let messagesReq = await fetch('/messages/get', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	let messages = await messagesReq.json();

	messages.forEach(message => {
		addMessage(message);
	})
})

getCookieForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	await fetch("/cookie/get", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			username: "" + usernameField.value,
		}),
	});
	usernameField.value = "";
});

messageForm.addEventListener('submit', async e => {
	e.preventDefault();

	let message = '' + messageField.value;

	messageField.value = '';

	socket.emit('chat message', { message: message });
});

socket.on('chat message', message => {
	addMessage(message);
	messagesContainer.scrollTop = messagesContainer.offsetHeight;
});