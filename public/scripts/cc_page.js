let rooms = document.getElementById('rooms');

let createRoomForm = document.getElementById('create-room-form');
let roomField = document.getElementById('room-name-field');

function addRoom(cc, room) {
    let roomDiv = document.createElement('div');
    roomDiv.className = 'room';

    let roomName = document.createElement('h3');
    roomName.className = 'room-name';
    roomName.innerText = room.name;

    let roomBtn = document.createElement('button');
    roomBtn.className = 'room-btn';
    roomBtn.innerText = 'Join!';
    roomBtn.dataset.roomName = room.name;
    roomBtn.addEventListener('click', e => {
        window.location.replace('/community/centers/cc/' + cc.name + '/' + room.name);
    });

    let roomRemoveBtn = document.createElement('button');
    roomRemoveBtn.className = 'room-rm-btn';
    roomRemoveBtn.innerText = 'Remove';
    roomRemoveBtn.dataset.roomName = room.name;
    roomRemoveBtn.addEventListener('click', async e => {
        await fetch('/community/centers/rooms/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cc_name: cc.name,
                room_name: roomRemoveBtn.dataset.roomName
            })
        });
        window.location.reload();
    });

    roomDiv.appendChild(roomName);
    roomDiv.appendChild(roomBtn);
    roomDiv.appendChild(roomRemoveBtn);

    rooms.appendChild(roomDiv);
}

document.addEventListener('DOMContentLoaded', async e => {
    let roomReq = await fetch(window.location.href + '/data/rooms/get', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    let roomResp = await roomReq.json();

    createRoomForm.dataset.ccName = roomResp.name;

    roomResp.rooms.forEach(room => {
        addRoom(roomResp, room);
    });
});

createRoomForm.addEventListener('submit', async e => {
    e.preventDefault();

    await fetch('/community/centers/rooms/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            cc_name: e.target.dataset.ccName,
            room_name: '' + roomField.value
        })
    });

    window.location.reload();

})