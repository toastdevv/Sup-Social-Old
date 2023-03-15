require('dotenv').config();

const fs = require('fs');

const express = require('express');
const session = require('express-session');

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const socketIoCookieParser = require('socket.io-cookie-parser');

// const helmet = require('helmet');

const passport = require('passport');
const passportSocketIo = require('passport.socketio');

const bcrypt = require('bcrypt');

const mongoose = require('mongoose');

const MongoStore = require('connect-mongo')(session);
const URI = process.env.MONGO_URI;
const store = new MongoStore({ url: URI });

const app = express();

app.disable('x-powered-by');

// Security Middleware

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

// Socket Handling

io.use(socketIoCookieParser());

const socketHandler = require('./socket/socketHandler');
socketHandler(io);

// Required Session Middleware

app.use(session({
    secret: process.env.SESSION_SECRET,
    key: 'sessionId',
    resave: true,
    saveUninitialized: true,
    store: store,
    cookie: { secure: false }
}));

// Passport Handling

app.use(passport.initialize());
app.use(passport.session());

io.use(passportSocketIo.authorize({
    cookieParser: cookieParser,
    key: 'sessionId',
    secret: process.env.SESSION_SECRET,
    store: store,
    success: onAuthorizeSuccess,
    fail: onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept) {
    console.log('Connected Successfully');
    accept(null, true);
};

function onAuthorizeFail(data, message, error, accept) {
    if (error) throw new Error(message);
    console.log('Connection Failure: ', message);
    accept(null, false);
}

// const auth = require('/auth/auth');
// auth(bcrypt, passport, User);

// Development Debugging Middleware

app.use((req, res, next) => {
    let date = new Date();
    console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${req.ip} - ${req.method} ${req.path}`);
    next();
});

app.use('/public', express.static(process.cwd() + '/public'));

// DB connection

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas

const { Schema } = mongoose;

const userSchema = require('./db_schemas/users')(Schema);
const dmSchema = require('./db_schemas/dms')(Schema);
const groupSchema = require('./db_schemas/groups')(Schema);
const ccSchema = require('./db_schemas/ccs')(Schema);
const roomSchema = require('./db_schemas/room')(Schema);

const User = mongoose.model('User', userSchema);
const DM = mongoose.model('DM', dmSchema);
const Group = mongoose.model('Group', groupSchema);
const CC = mongoose.model('CC', ccSchema);
const Room = mongoose.model('Room', roomSchema);

// Route handling

// Later import the routes here, then make the required changes client side

/*
app.get('/', (req, res) => {
    res.render('dms', {username: req.user.username});
});

app.get('/chat/:username', (req, res) => {
    res.render('chat', {username: req.params.username});
})
*/

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

app.get('/community/centers/cc/:cc_name', (req, res) => {
    res.render('cc_page', {cc_name: req.params.cc_name});
});

app.get('/community/centers/cc/:cc_name/:room_name', (req, res) => {
    res.render('room', {cc_name: req.params.cc_name, room_name: req.params.room_name});
});

app.get('/community/centers/cc/:cc_name/:room_name/messages/get', (req, res) => {
    let messages = JSON.parse(fs.readFileSync('cc_messages.json').toString()).filter(i => {return i.toCc == req.params.cc_name && i.toRoom == req.params.room_name});
    res.json(messages);
});

app.get('/community/centers/data/get', (req, res) => {
    let ccs = JSON.parse(fs.readFileSync('ccs.json').toString());
    res.json(ccs);
});

app.get('/community/centers/cc/:cc_name/data/rooms/get', (req, res) => {
    let rooms = JSON.parse(fs.readFileSync('ccs.json').toString()).filter(i => {return i.name == req.params.cc_name})[0];
    res.json(rooms);
});

app.post('/community/centers/new/create', (req, res) => {
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

app.post('/community/centers/rooms/create', (req, res) => {
    fs.readFile('ccs.json', (err, data) => {
        var db = JSON.parse(data.toString());
        var channelExists = false;
        var temp = 0;
        for (let i in db) {
            if (db[i].name == req.body.cc_name) {
                temp = i;
                for (let j in db[i].rooms) {
                    if (db[i].rooms[j].name == req.body.room_name) {
                        console.log(db[i].rooms[j].name);
                        channelExists = true;
                        break;
                    }
                }
                break;
            }
        }
        if (!channelExists) {
            db[temp].rooms.push({
                name: req.body.room_name
            });
            fs.writeFileSync('ccs.json', JSON.stringify(db));
            res.send('success');
        } else {
            res.send('exists');
        }
    });
});

app.delete('/community/centers/data/delete', (req, res) => {
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
        for (let i = 0; i < db.length; i++) {
            if (db[i].toCc == req.body.cc_name) {
                db.splice(i,1);
                i--;
            }
        }
        fs.writeFileSync('cc_messages.json', JSON.stringify(db));
    });
    res.send('success');
});

app.delete('/community/centers/rooms/delete', (req, res) => {
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
        for (let i = 0; i < db.length; i++) {
            if (db[i].toCc == req.body.cc_name && db[i].toRoom == req.body.room_name) {
                db.splice(i,1);
                i--;
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