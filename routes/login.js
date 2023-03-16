require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');

module.exports = () => {
    router.get('/', (req, res) => {
        res.render('login');
    });

    router.post('/auth',
    passport.authenticate('local', { failureRedirect: '/login', failureMessage: 'Login Failed' }),
    (req, res) => {
        res.redirect('/dms');
    });
    return router;
}