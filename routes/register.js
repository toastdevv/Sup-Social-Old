require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = (User) => {
    router.get('/', (req, res) => {
        res.render('register');
    });

    router.post('/auth', (req, res, next) => {
        User.findOne({ email: req.body.email }).then(doc => {
            if (doc !== null) {
                res.send({ error: "Email is already in use!" });
                next();
            } else {
                User.findOne({ username: req.body.username }).then(doc => {
                    if (doc !== null) {
                        res.send({ error: "Username is already in use!" });
                        next();
                    } else {
                        let hash = bcrypt.hashSync(req.body.password, 12);
                        let newUser = new User({
                            username: req.body.username,
                            password: hash,
                            email: req.body.email,
                            friends: [],
                            ccs: []
                        });

                        newUser.save().then(doc => {
                            res.redirect('/dms');
                            next(null, doc);
                        }).catch(err => {
                            console.log(err);
                            next(err);
                        });
                    }
                }).catch(err => {
                    next(err);
                    console.log(err);
                });
            }
        }).catch(err => {
            next(err);
            console.log(err);
        });
    }, passport.authenticate('local', { failureRedirect: '/register', failureMessage: 'Register Failure' }));
    return router;
}