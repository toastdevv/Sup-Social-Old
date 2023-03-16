require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = (CC) => {
    router.get('/:cc_id/:room_id', (req, res) => {
        CC.findById(req.params.cc_id).then(cc => {
            for (let i in cc.rooms) {
                if (cc.rooms[i]._id == req.params.room_id) {
                    res.render('room', {cc_name: cc.cc_name, room_name: cc.rooms[i].room_name});
                    break;
                }
            }
        }).catch(err => {
            console.log(err);
        });
    });

    router.get('/:cc_id/:room_id/messages/get', (req, res) => {
        CC.findById(req.params.cc_id).then(cc => {
            for (let i in cc.rooms) {
                if (cc.rooms[i]._id == req.params.room_id) {
                    cc.populate('rooms.' + i + '.messages.username').then(doc => {
                        res.json(doc.rooms[i].messages.map(i => { return {
                            username: i.username.username,
                            message: i.message,
                            edited: i.edited
                        } }));
                    });
                    break;
                }
            }
        }).catch(err => {
            console.log(err);
        });
    });

    router.post('/create', (req, res) => {
        CC.findById(req.body.cc_id).then(doc => {
            let newRoom = doc.rooms.create({
                room_name: req.body.room_name,
                public: true,
                access_ranks: [],
                messages: []
            });
            doc.rooms.push(newRoom);
            doc.save().then(doc => {
                res.json(doc);
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err);
        });
    });

    router.delete('/delete', (req, res) => {
        CC.findById(req.body.cc_id).then(cc => {
            for (let i in cc.rooms) {
                if (cc.rooms[i]._id == req.body.room_id) {
                    cc.rooms.splice(i, 1);
                    break;
                }
            }
            cc.save().then(doc => {
                res.json(doc);
            }).catch(err => {
                console.log(err);
            });
        });
        res.send('success');
    });

    return router;
}