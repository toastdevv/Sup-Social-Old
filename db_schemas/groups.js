module.exports = (mongoose, Schema) => {
    const groupMessageSchema = new Schema({
        username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        edited: { type: Boolean, default: false },
        message: { type: String, required: true },
        to: { type: mongoose.Types.ObjectId, required: true, ref: 'users' }
    }, {
        timestamps: { createdAt: 'sent_at', updatedAt: 'edited_at' }
    });

    const groupSchema = new Schema({
        group_name: { type: String, required: true },
        created_by: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        owned_by: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        members: [{ type: new Schema({
            username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' }
        }), required: true }],
        messages: [groupMessageSchema]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'groups'
    });

    return groupSchema;
}