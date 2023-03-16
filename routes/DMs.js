require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = (User, DM) => {
    router.get('/', (req, res) => {
        res.render('dms', {username: req.user.username});
    });

    router.get('/messages/get/:dm_id', (req, res) => {
        DM.findOne({
            $or: [
                {
                    members: [ req.params.dm_id, req.user._id ]
                },
                {
                    members: [ req.user._id, req.params.dm_id ]
                }
            ]
        }).then(doc => {
            if (doc === null) {
                let newDM = new DM({
                    members: [ req.params.dm_id, req.user._id ],
                    messages: []
                });
                newDM.save().catch(err => {
                    console.log(err);
                });
            } else {
                doc.populate('messages.username').then(doc => {
                    res.json(doc.messages.map(e => { return {
                        username: e.username.username,
                        message: e.message,
                        to: e.to,
                        edited: e.edited
                    } }));
                });
            }
        }).catch(err => {
            console.log(err);
        })
    });

    router.get('/chat/:user_id', (req, res) => {
        User.findById(req.params.user_id).then(doc => {
            res.render('chat', {username: doc.username});
        }).catch(err => {
            console.log(err);
        });
    });

    return router;
}