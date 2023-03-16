require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = (User) => {

    router.get('/get', (req, res) => {
        User.find({}).then(doc => {
            res.json(doc.filter(i => { return '' + i._id !== '' + req.user._id }));
        }).catch(err => {
            console.log(err);
        });
    });
    return router;
}