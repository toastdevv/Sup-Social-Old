module.exports = (Schema) => {
    const ccSchema = new Schema({
        cc_name: { type: String, required: true },
        created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        owned_by: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        ranks: [new Schema({
            name: { type: String, required: true },
            perms: [{ type: String }]
        })],
        members: [{ type: new Schema({
            username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
            ranks: [{ type: String }]
        }), required: true }],
        rooms: [new Schema({
            room_name: { type: String, required: true },
            public: true,
            access_ranks: [{ type: mongoose.Types.ObjectId, ref: 'ccs.ranks' }],
            messages: [roomMessageSchema]
        })]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'ccs'
    });

    const roomMessageSchema = new Schema({
        username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        edited: { type: Boolean, default: false },
        message: { type: String, required: true },
        toCc: { type: mongoose.Types.ObjectId, required: true, ref: 'ccs' },
        toRoom: { type: mongoose.Types.ObjectId, required: true, ref: 'cc_rooms.rooms' }
    }, {
        timestamps: { createdAt: 'sent_at', updatedAt: 'edited_at' }
    });

    return ccSchema;
}