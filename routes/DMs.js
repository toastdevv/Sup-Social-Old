require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = (DM) => {
    app.get('/', (req, res) => {
        res.render('dms', {username: req.user.username});
    });

    app.get('/:username', (req, res) => {
        res.render('chat', {username: req.params.username});
    });
    
    return router;
}