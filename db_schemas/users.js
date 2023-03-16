module.exports = (mongoose, Schema) => {
    const userSchema = new Schema({
        username: { type: String, required: true },
        password: { type: String, required: true },
        email: { type: String, required: true },
        friends: [new Schema({
            username: { type: mongoose.Types.ObjectId, required: true, ref: 'users' }
        }, { timestamps: { createdAt: 'friend_since' }})],
        ccs: [new Schema({
            cc_name: { type: mongoose.Types.ObjectId, required: true, ref: 'ccs' }
        }, { timestamps: { createdAt: 'joined_since' }})]
    }, {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        collection: 'users'
    });

    return userSchema;
}