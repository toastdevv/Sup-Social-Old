let rooms = document.getElementById('rooms');

let createRoomForm = document.getElementById('create-room-form');
let roomField = document.getElementById('room-name-field');

function addRoom(cc, room) {
    let roomDiv = document.createElement('div');
    roomDiv.className = 'room';

    let roomName = document.createElement('h3');
    roomName.className = 'room-name';
    roomName.innerText = room.room_name;

    let roomBtn = document.createElement('button');
    roomBtn.className = 'room-btn';
    roomBtn.innerText = 'Join!';
    roomBtn.dataset.roomId = room._id;
    roomBtn.addEventListener('click', e => {
        window.location.replace('/community/centers/rooms/' + cc._id + '/' + e.target.dataset.roomId);
    });

    let roomRemoveBtn = document.createElement('button');
    roomRemoveBtn.className = 'room-rm-btn';
    roomRemoveBtn.innerText = 'Remove';
    roomRemoveBtn.dataset.roomId = room._id;
    roomRemoveBtn.addEventListener('click', async e => {
        await fetch('/community/centers/rooms/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                cc_id: cc._id,
                room_id: e.target.dataset.roomId
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

    createRoomForm.dataset.ccId = roomResp._id;

    console.log(roomResp);

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
            cc_id: e.target.dataset.ccId,
            room_name: '' + roomField.value
        })
    });

    window.location.reload();

});