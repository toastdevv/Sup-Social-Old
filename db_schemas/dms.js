module.exports = (mongoose, Schema) => {
    const dmMessageSchema = new Schema({
        username: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
        edited: { type: Boolean, default: false },
        message: { type: String, required: true },
        to: { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
    }, {
        timestamps: { createdAt: 'sent_at', updatedAt: 'edited_at' }
    });

    const dmSchema = new Schema({
        members: [
            { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
            { type: mongoose.Types.ObjectId, required: true, ref: 'User' }
        ],
        messages: [{ type: dmMessageSchema }]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'dms'
    });

    return dmSchema;
}