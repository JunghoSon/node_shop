const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {autoIncrement} = require('mongoose-plugin-autoinc');

const ProductsSchema = new Schema({
    name: String,
    price: Number,
    description: String,
    created_at: {
        type: Date,
        default: Date.now()
    }
});

ProductsSchema.plugin(autoIncrement, {model: 'products', field: 'id', startAt: 1});
module.exports = mongoose.model('products', ProductsSchema);