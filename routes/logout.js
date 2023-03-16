require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = () => {
    router.get('/', (req, res) => {
        req.logout((err) => {
            if (err) return console.log(err);
            res.redirect('/login');
        });
    });
    return router;
}