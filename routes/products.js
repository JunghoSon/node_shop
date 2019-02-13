const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');
const co = require('co');

router.get('/:id', async (req, res) => {
    const {id} = req.params;

    try{
        const product = await ProductsModel.findOne({id: id});
        const comments = await CommentsModel.find({product_id: id});

        res.render('products/detail', {product: product, comments: comments});
    }catch(err){
        throw err;
    }
});

module.exports = router;