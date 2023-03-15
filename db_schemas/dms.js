module.exports = (Schema) => {
    const dmSchema = new Schema({
        members: [
            { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
            { type: mongoose.Types.ObjectId, required: true, ref: 'users' }
        ],
        messages: [dmMessageSchema]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'dms'
    });

    const dmMessageSchema = new Schema({
        username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
        edited: { type: Boolean, default: false },
        message: { type: String, required: true },
        to: { type: mongoose.Types.ObjectId, required: true, ref: 'group_dms' }
    }, {
        timestamps: { createdAt: 'sent_at', updatedAt: 'edited_at' }
    });

    return dmSchema;
}