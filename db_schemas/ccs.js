module.exports = (mongoose, Schema) => {
    const roomMessageSchema = new Schema({
        username: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        edited: { type: Boolean, default: false },
        message: { type: String, required: true },
        toCc: { type: mongoose.Types.ObjectId, required: true, ref: 'CC' },
        toRoom: { type: mongoose.Types.ObjectId, required: true, ref: 'CC.rooms' }
    }, {
        timestamps: { createdAt: 'sent_at', updatedAt: 'edited_at' }
    });

    const ccSchema = new Schema({
        cc_name: { type: String, required: true },
        created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        owned_by: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        ranks: [{ type: new Schema({
            name: { type: String, required: true },
            perms: [{ type: String }]
        }) }],
        members: [{ type: new Schema({
            username: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
            ranks: [{ type: String }]
        }) }],
        rooms: [{ type: new Schema({
            room_name: { type: String, required: true },
            public: { type: Boolean, required: true, default: true },
            access_ranks: [{ type: mongoose.Types.ObjectId, ref: 'CC.ranks' }],
            messages: [roomMessageSchema]
        }) }]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'ccs'
    });

    return ccSchema;
}