require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = (CC) => {
    router.get('/', (req, res) => {
        res.render('ccs');
    });

    router.get('/:cc_id', (req, res) => {
        CC.findById(req.params.cc_id).then(doc => {
            res.render('cc_page', {cc_name: doc.cc_name});
        }).catch(err => {
            console.log(err);
        });
    });

    router.get('/data/get', (req, res) => {
        CC.find({}).then(doc => {
            res.json(doc);
        }).catch(err => {
            console.log(err);
        });
    });

    router.get('/:cc_id/data/rooms/get', (req, res) => {
        CC.findById(req.params.cc_id).then(doc => {
            res.json(doc);
        }).catch(err => {
            console.log(err);
        });
    });

    router.post('/new/create', (req, res) => {
        let newCC = new CC({
            cc_name: req.body.cc_name,
            created_by: req.user._id,
            owned_by: req.user._id,
            ranks: [],
            members: [{
                username: req.user._id,
                ranks: []
            }],
            rooms: []
        });

        newCC.save().then(doc => {
            let defaultRoom = doc.rooms.create({
                room_name: 'chat',
                public: true,
                access_ranks: [],
                messages: []
            });
            doc.rooms.push(defaultRoom);
            doc.save().then(doc => {
                res.json(doc);
            }).catch(err => {
                console.log(err);
            });
        }).catch(err => {
            console.log(err)
        });
    });

    router.delete('/data/delete', (req, res) => {
        CC.findByIdAndRemove(req.body.cc_id).then(doc => {
            console.log(doc);
            res.json(doc);
        }).catch(err => {
            console.log(err);
        });
    });
    return router;
}