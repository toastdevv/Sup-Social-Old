require('dotenv').config();

const express = require('express');
const helmet = require('helmet');

const app = express();

const helmetMiddleware = require('./middleware/helmetMiddleware');
helmetMiddleware(app, helmet);

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html');
});

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log('Listening on port ' + PORT + '!');
});