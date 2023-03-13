let getCookieForm = document.getElementById("username-cookie-form");
let usernameField = document.getElementById("username-field");

let dmsContainer = document.getElementById('dms');

function addDm(user) {
    let dmDiv = document.createElement('div');
    dmDiv.className = 'dm';

    let dmName = document.createElement('h3');
    dmName.className = 'dm-name';
    dmName.innerText = user.username;

    let dmBtn = document.createElement('button');
    dmBtn.className = 'dm-btn';
    dmBtn.dataset.user = user.username;
    dmBtn.addEventListener('click', e => {
        window.location.replace('/chat/' + user.username);
    });
    dmBtn.innerText = 'Chat!';

    dmDiv.appendChild(dmName);
    dmDiv.appendChild(dmBtn);

    dmsContainer.appendChild(dmDiv);
}

document.addEventListener('DOMContentLoaded', async e => {
    let usersReq = await fetch('/users/get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let users = await usersReq.json();

    users.forEach(user => {
        addDm(user);
    });
});

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

    window.location.href = window.location.href;

});
