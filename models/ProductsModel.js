const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const {autoIncrement} = require('mongoose-plugin-autoinc');

const ProductsSchema = new Schema({
    name: {
        type: String,
        required: [true, '제목을 입력해 주세요.']
    },
    thumbnail: String,
    price: Number,
    description: String,
    created_at: {
        type: Date,
        default: Date.now()
    },
    username: String
});

ProductsSchema.virtual('getDate').get(function(){
    const date = new Date(this.created_at);

    return {
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        day: date.getDate()
    }
});

ProductsSchema.plugin(autoIncrement, {model: 'products', field: 'id', startAt: 1});
module.exports = mongoose.model('products', ProductsSchema);