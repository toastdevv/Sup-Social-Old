let messageForm = document.getElementById("message-form");
let messageField = document.getElementById("message-field");

let messagesContainer = document.getElementById("messages-container");

let locTemp = window.location.href.split("/");

let dmId = locTemp[locTemp.length - 1];

console.log(dmId);

/*global io*/
const socket = io();

socket.emit("dm join", { dmId });

function addMessage(message) {
	let messageDiv = document.createElement("div");
	messageDiv.classList.add("message");

	let messageText = document.createElement("p");
	messageText.style.fontSize = "1.3em";
	messageText.innerText = message.username + ": " + message.message;

	messageDiv.appendChild(messageText);

	messagesContainer.appendChild(messageDiv);

	messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

document.addEventListener("DOMContentLoaded", async (e) => {
	let messagesReq = await fetch("/dms/messages/get/" + dmId, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	let messages = await messagesReq.json();

	messages.forEach((message) => {
		addMessage(message);
	});
});

messageForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	let message = "" + messageField.value;

	messageField.value = "";

	socket.emit("dm message", { message: message, dmId });
});

socket.on("dm message", (message) => {
	addMessage(message);
});
