module.exports = (io, CC, DM) => {
    function makeDmName(socket, message) {
        let username = socket.request.user._id;
        let to = message.dmId;
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
        return message.cc_id + '-' + message.room_id;
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
            let user_id = socket.request.user._id;
            let to = message.dmId;
            let msg = message.message;
            DM.findOne({
                $or: [
                    {
                        members: [ user_id, to ]
                    },
                    {
                        members: [ to, user_id ]
                    }
                ]
            }).then(cc => {
                let newMessage = cc.messages.create({
                    username: user_id,
                    message: msg,
                    edited: false,
                    to: to
                });
                cc.messages.push(newMessage);
                cc.save().then(doc => {
                    io.in(makeDmName(socket, message)).emit('dm message', {
                        username: socket.request.user.username,
                        message: msg
                    });
                });
            });
        });
        socket.on('room message', message => {
            let username = socket.request.user._id;
            let toCc = message.cc_id;
            let toRoom = message.room_id;
            let msg = message.message;
            CC.findById(toCc).then(cc => {
                for (let i in cc.rooms) {
                    if (cc.rooms[i]._id == toRoom) {
                        let newMessage = cc.rooms[i].messages.create({
                            username: username,
                            edited: false,
                            message: msg,
                            toCc: toCc,
                            toRoom: toRoom
                        });
                        cc.rooms[i].messages.push(newMessage);
                        cc.save().then(doc => {
                            io.in(makeRoomName(message)).emit('room message', {
                                username: socket.request.user.username,
                                message: msg
                            });
                        }).catch(err => {
                            console.log(err);
                        });
                    }
                }
            });
        });
    });
}