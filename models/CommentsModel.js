const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {autoIncrement} = require('mongoose-plugin-autoinc');

const CommentsSchema = new Schema({
    content: String,
    created_at: {
        type: Date,
        default: Date.now()
    },
    product_id: Number
});

CommentsSchema.plugin(autoIncrement, {model: 'comments', field: 'id', startAt: 1});

module.exports = mongoose.model('comments', CommentsSchema);
