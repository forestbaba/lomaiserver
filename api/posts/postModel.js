const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema(
    {
        post: { type: String, required: true },
        user: { type: String, required: true },
        image: { type: String },

        created: {type: Date, default: Date.now},

    });
module.exports = User = mongoose.model('Post', PostSchema);