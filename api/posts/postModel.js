const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        post: { type: String, required: true },
        user: { type: String, required: true },
        image: { type: String },

        created: Date,

    },
    {
        collection: 'posts',
        strict: true,
        autoIndex: true
    }
);
module.exports = User = mongoose.model('Post', PostSchema);