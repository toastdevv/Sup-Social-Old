require('dotenv').config();

const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const session = require('express-session');
const io = require('socket.io');

const app = express();

app.disable('x-powered-by');

const helmetMiddleware = require('./middleware/helmetMiddleware');
helmetMiddleware(app, helmet);
const viewEngine = require('./utilities/viewEngine');

viewEngine(app, fs);

app.set('views', './views');
app.set('view engine', 'sup');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

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
    }
    next();
})

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
    console.log(req.user);
    res.render('index', {title: "hey"});
});

app.post('/cookie/get', (req, res) => {
    res.cookie('username', req.body.username, { maxAge: 999999999, secure: true, httpOnly: true });
    fs.readFile('users.json', (err, data) => {
        let db = JSON.parse(data.toString());
        if (!db.includes({ username: req.body.username })) {
            db.push({
                username: req.body.username
            });
            fs.writeFileSync('users.json', JSON.stringify(db));
        }
        res.send('success');
    });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '!');
});