require('dotenv').config();

const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIoCookieParser = require('socket.io-cookie-parser');
const helmet = require('helmet');
const session = require('express-session');

const app = express();

app.disable('x-powered-by');

// let helmetMiddleware = require('./middleware/helmetMiddleware');
// helmetMiddleware(app, helmet);

const viewEngine = require('./utilities/viewEngine');

viewEngine(app, fs);

app.set('views', './views');
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

const http = require('http').createServer(app);
const io = require('socket.io')(http);

// MVP socket handling

io.use(socketIoCookieParser());

io.use((socket, next) => {
    if (socket.request.cookies.username) {
        socket.request.user = {
            username: socket.request.cookies.username
        }
    } else {
        socket.request.user = {
            username: 'Guest'
        }
    }
    next();
})

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

app.use(session({
    secret: process.env.SESSION_SECRET,
    key: 'express.sid',
    resave: true,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true }
}));

app.use((req, res, next) => {
    let date = new Date();
    console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${req.ip} - ${req.method} ${req.path}`);
    next();
});

app.use((req, res, next) => {
    if (req.cookies.username) {
        req.user = {
            username: req.cookies.username
        }
    } else {
        req.user = {
            username: 'Guest'
        }
    }
    next();
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
    res.render('index', {username: req.user.username});
});

app.get('/chat/:username', (req, res) => {
    res.render('chat', {username: req.params.username});
})

app.get('/messages/get/:dm_name', (req, res) => {
    let messages = JSON.parse(fs.readFileSync('messages.json').toString()).filter(i => {return (i.username == req.params.dm_name && i.to == req.user.username) || (i.to == req.params.dm_name && i.username == req.user.username)});
    res.json(messages);
});

app.get('/users/get', (req, res) => {
    let users = JSON.parse(fs.readFileSync('users.json').toString()).filter(i => {return i.username != req.user.username});
    res.json(users);
});

app.post('/cookie/get', (req, res) => {
    res.cookie('username', req.body.username, { maxAge: 99999999999 * 60 * 24, httpOnly: true });
    fs.readFile('users.json', (err, data) => {
        var db = JSON.parse(data.toString());
        var userExists = false;
        for (let i in db) {
            if (db[i].username == req.body.username) {
                userExists = true;
                break;
            }
        }
        if (!userExists) {
            db.push({
                username: req.body.username
            });
            fs.writeFileSync('users.json', JSON.stringify(db));
        }
        res.send('success');
    });
});

app.get('/community/centers', (req, res) => {
    res.render('ccs');
});

app.get('/community/centers/:cc_name', (req, res) => {
    res.render('cc_page', {name: req.params.cc_name});
});

app.get('/community/centers/:cc_name/:room_name', (req, res) => {
    res.render('room', {cc_name: req.params.cc_name, room_name: req.params.room_name});
});

app.get('/community/centers/get', (req, res) => {
    let ccs = JSON.parse(fs.readFileSync('ccs.json').toString());
    res.json(ccs);
});

app.get('/community/centers/:cc_name/rooms/get', (req, res) => {
    let rooms = JSON.parse(fs.readFileSync('ccs.json').toString()).filter(i => {i.name == req.params.cc_name})[0].rooms;
    res.json(rooms);
});

app.post('/community/centers/create', (req, res) => {
    fs.readFile('ccs.json', (err, data) => {
        var db = JSON.parse(data.toString());
        var ccExists = false;
        for (let i in db) {
            if (db[i].name == req.body.cc_name) {
                ccExists = true;
                break;
            }
        }
        if (!ccExists) {
            db.push({
                name: req.body.cc_name,
                rooms: []
            });
            fs.writeFileSync('ccs.json', JSON.stringify(db));
            res.send('success');
        } else {
            res.send('exists');
        }
    });
});

app.post('/community/centers/room/create', (req, res) => {
    fs.readFile('ccs.json', (err, data) => {
        var db = JSON.parse(data.toString());
        var channelExists = false;
        var temp = [0,0];
        for (let i in db) {
            if (db[i].name == req.body.cc_name) {
                for (let j in db[i].rooms) {
                    if (db[i].rooms[j].name == req.body.room_name) {
                        channelExists = true;
                        temp = [i, j];
                        break;
                    }
                }
                break;
            }
        }
        if (!channelExists) {
            db[temp[0]].rooms[temp[1]].push({
                name: req.body.room_name
            });
            fs.writeFileSync('ccs.json', JSON.stringify(db));
            res.send('success');
        } else {
            res.send('exists');
        }
    });
});

app.delete('/community/centers/delete', (req, res) => {
    fs.readFile('ccs.json', (err, data) => {
        var db = JSON.parse(data.toString());
        for (let i in db) {
            if (db[i].name == req.body.cc_name) {
                db.splice(i,1);
                break;
            }
        }
        fs.writeFileSync('ccs.json', JSON.stringify(db));
    });
    fs.readFile('cc_messages.json', (err, data) => {
        var db = JSON.parse(data.toString());
        for (let i in db) {
            if (db[i].toCc == req.body.cc_name) {
                db.splice(i,1);
                break;
            }
        }
        fs.writeFileSync('cc_messages.json', JSON.stringify(db));
    });
    res.send('success');
});

app.delete('/community/centers/room/delete', (req, res) => {
    fs.readFile('ccs.json', (err, data) => {
        var db = JSON.parse(data.toString());
        for (let i in db) {
            if (db[i].name == req.body.cc_name) {
                for (let j in db[i].rooms) {
                    if (db[i].rooms[j].name == req.body.room_name) {
                        db[i].rooms.splice(j,1);
                        break;
                    }
                }
                break;
            }
        }
        fs.writeFileSync('ccs.json', JSON.stringify(db));
    });
    fs.readFile('cc_messages.json', (err, data) => {
        var db = JSON.parse(data.toString());
        for (let i in db) {
            if (db[i].toCc == req.body.cc_name) {
                if (db[i].toRoom == req.body.room_name) {
                    db.splice(i,1);
                }
            }
        }
        fs.writeFileSync('cc_messages.json', JSON.stringify(db));
    });
    res.send('success');
});

const PORT = process.env.PORT;
http.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '!');
});