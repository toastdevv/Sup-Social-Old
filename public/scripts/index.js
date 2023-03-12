let getCookieForm = document.getElementById("username-cookie-form");
let usernameField = document.getElementById("username-field");

/*global io*/
const socket = io();

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
