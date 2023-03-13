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

function compareUsernames (socket, message) {
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

io.on('connection', socket => {
    socket.on('join', message => {
        socket.join(compareUsernames(socket, message));
        console.log(compareUsernames(socket, message));
    });
    socket.on('chat message', message => {
        let username = socket.request.user.username;
        let from = username;
        let to = message.dmName;
        let msg = message.message;
        fs.readFile('messages.json', (err, data) => {
            if (err) return console.log(err);
            let db = JSON.parse(data.toString());
            db.push({
                username: username,
                message: msg,
                from: from,
                to: to
            });
            io.in(compareUsernames(socket, message)).emit('chat message', {
                message: msg,
                username: username
            });
            fs.writeFileSync('messages.json', JSON.stringify(db));
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
    console.log(req.ip + ' - ' + req.method + ' ' + req.path);
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
    res.render('index');
});

app.get('/chat/:username', (req, res) => {
    res.render('chat');
})

app.get('/messages/get/:dm_name', (req, res) => {
    let messages = JSON.parse(fs.readFileSync('messages.json').toString()).filter(i => {return (i.from == req.params.dm_name && i.to == req.user.username) || (i.to == req.params.dm_name && i.from == req.user.username)});
    res.json(messages);
});

app.get('/users/get', (req, res) => {
    let users = JSON.parse(fs.readFileSync('users.json').toString()).filter(i => {return i.username != req.user.username});
    res.json(users);
});

app.post('/cookie/get', (req, res) => {
    res.cookie('username', req.body.username, { maxAge: 99999999999 * 60 * 24, secure: true, httpOnly: true });
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

const PORT = process.env.PORT;
http.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '!');
});