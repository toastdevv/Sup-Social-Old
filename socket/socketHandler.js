module.exports = (io) => {
    function makeDmName(socket, message) {
        let username = socket.request.user.username;
        let to = message.dmName;
        let first = [username, to].sort(function(a, b){
            if(a < b) { return -1; }
            if(a > b) { return 1; }
            return 0;
        });
        let last = [username, to].sort(function(a, b){
            if(a > b) { return -1; }
            if(a < b) { return 1; }
            return 0;
        });
        return first[0] + '-' + last[0];
    }

    function makeRoomName(message) {
        return message.cc_name + '-' + message.room_name;
    }

    io.on('connection', socket => {
        socket.on('dm join', message => {
            socket.join(makeDmName(socket, message));
            console.log(makeDmName(socket, message));
        });
        socket.on('room join', message => {
            socket.join(makeRoomName(message));
            console.log(makeRoomName(message));
        });
        socket.on('dm message', message => {
            let username = socket.request.user.username;
            let to = message.dmName;
            let msg = message.message;
            fs.readFile('messages.json', (err, data) => {
                let db = JSON.parse(data.toString());
                db.push({
                    username: username,
                    message: msg,
                    to: to
                });
                io.in(makeDmName(socket, message)).emit('dm message', {
                    message: msg,
                    username: username
                });
                fs.writeFileSync('messages.json', JSON.stringify(db));
            });
        });
        socket.on('room message', message => {
            let username = socket.request.user.username;
            let toCc = message.cc_name;
            let toRoom = message.room_name;
            let msg = message.message;
            fs.readFile('cc_messages.json', (err, data) => {
                let db = JSON.parse(data.toString());
                db.push({
                    username: username,
                    message: msg,
                    toCc: toCc,
                    toRoom: toRoom
                });
                io.in(makeRoomName(message)).emit('room message', {
                    message: msg,
                    username: username
                });
                fs.writeFileSync('cc_messages.json', JSON.stringify(db));
            });
        });
    });
}