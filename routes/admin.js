const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');

router.get('/', (req, res) => {
    res.send('admin page');
});

router.get('/products', (req, res) => {
    ProductsModel.find({}, (err, results) => {
        if(err) throw err;

        res.render('admin/products', {products: results});
    });
});

router.get('/products/write', (req, res) => {
    res.render('admin/form');
});

router.post('/products/write', (req, res) => {
    const {name, price, description} = req.body;

    const product = new ProductsModel({
        name, price, description
    });

    product.save(err => {
        if(err) throw err;
        res.redirect('/admin/products');
    });
});

router.get('/products/detail/:id', (req, res) => {
    const {id} = req.params;

    ProductsModel.findOne({id: id}, (err, product) => {
        if(err) throw err;
        res.render('admin/productDetail', {product});
    });
});

module.exports = router;