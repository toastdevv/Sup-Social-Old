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

const mongoose = require('mongoose');

const MongoStore = require('connect-mongo');
const URI = process.env.MONGO_URI;
const store = MongoStore.create({
                mongoUrl: process.env.MONGO_URI,
                mongooseConnection: mongoose.connection
            });

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

io.use(socketIoCookieParser());

// Required Session Middleware

app.use(session({
    secret: process.env.SESSION_SECRET,
    key: 'session.sid',
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
    key: 'session.sid',
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
    console.log(`${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${req.ip.replace("::ffff:", '')} - ${req.method} ${req.path}`);
    next();
});

app.use('/public', express.static(process.cwd() + '/public'));

// DB connection

mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Schemas

const { Schema } = mongoose;

const userSchema = require('./db_schemas/users')(mongoose, Schema);
const dmSchema = require('./db_schemas/dms')(mongoose, Schema);
const groupSchema = require('./db_schemas/groups')(mongoose, Schema);
const ccSchema = require('./db_schemas/ccs')(mongoose, Schema);

const User = mongoose.model('User', userSchema);
const DM = mongoose.model('DM', dmSchema);
const Group = mongoose.model('Group', groupSchema);
const CC = mongoose.model('CC', ccSchema);

// Local Authentication Strategy

const localAuth = require('./auth/auth');
localAuth(User);

// Socket Handling

const socketHandler = require('./socket/socketHandler');
socketHandler(io, CC, DM);

// Route handling

const ensureAuth = require('./utilities/ensureAuth');

const indexRoute = require('./routes/index')();
const loginRoute = require('./routes/login')();
const logoutRoute = require('./routes/logout')();
const registerRoute = require('./routes/register')(User);
const usersRoute = require('./routes/users')(User);
const dmsRoute = require('./routes/DMs')(User, DM);
const groupsRoute = require('./routes/groups')(Group);
const ccsRoute = require('./routes/CCs')(CC);
const roomsRoute = require('./routes/rooms')(CC);

app.use('/', indexRoute);
app.use('/login', loginRoute);
app.use('/register', registerRoute);
app.use('/logout', ensureAuth, logoutRoute);
app.use('/users', ensureAuth, usersRoute);
app.use('/dms', ensureAuth, dmsRoute);
app.use('/groups', ensureAuth, groupsRoute);
app.use('/community/centers/cc', ensureAuth, ccsRoute);
app.use('/community/centers/rooms', ensureAuth, roomsRoute);

app.get('/test', (req, res) => {
    res.render('test');
});

// // 40x status handling

// app.use((req, res, next) => {
//     res.status(403).type('text').send('Forbidden');
//     next();
// });

// app.use((req, res, next) => {
//     res.status(404).type('text').send('Resource/Page Not Found');
//     next();
// });

// // Server Error Handling

// app.use((error, req, res, next) => {
//     res.status(500).send('Internal Server Error!');
//     console.log(error);
//     next();
// });

// app.post('/cookie/get', (req, res) => {
//     res.cookie('username', req.body.username, { maxAge: 99999999999 * 60 * 24, httpOnly: true });
//     fs.readFile('users.json', (err, data) => {
//         var db = JSON.parse(data.toString());
//         var userExists = false;
//         for (let i in db) {
//             if (db[i].username == req.body.username) {
//                 userExists = true;
//                 break;
//             }
//         }
//         if (!userExists) {
//             db.push({
//                 username: req.body.username
//             });
//             fs.writeFileSync('users.json', JSON.stringify(db));
//         }
//         res.send('success');
//     });
// });

const PORT = process.env.PORT;
http.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '!');
});