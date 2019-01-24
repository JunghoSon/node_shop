const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');

router.get('/', async (req, res) => {
    try{
        const products = await ProductsModel.find();
        res.render('home', {products: products});
    }catch(err){
        throw err;
    }
});

module.exports = router;