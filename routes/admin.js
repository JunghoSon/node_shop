const express = require('express');
const router = express.Router();
const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');

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
    res.render('admin/form', {product: {}});
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

        CommentsModel.find({product_id: id}, (err, comments) => {
            res.render('admin/productDetail', {product, comments});
        });
    });
});

router.get('/products/edit/:id', (req, res) => {
    const {id} = req.params;

    ProductsModel.findOne({id: id}, (err, product) => {
        if(err) throw err;
        res.render('admin/form', {product: product});
    });
});

router.post('/products/edit/:id', (req, res) => {
    const {id} = req.params;
    const {name, price, description} = req.body;
    const query = {name, price, description};

    ProductsModel.update({id: id}, {$set: query}, err => {
        if(err) throw err;
        res.redirect(`/admin/products/detail/${id}`);
    });
});

router.get('/products/delete/:id', (req, res) => {
    const {id} = req.params;

    ProductsModel.remove({id: id}, err => {
        if(err) throw err;
        res.redirect('/admin/products');
    });
});

router.post('/products/ajax_comment/insert', async (req, res) => {
    const {content, product_id} = req.body;

    try{

        const comment = new CommentsModel({content, product_id: parseInt(product_id)});
        const data = await comment.save();

        res.json({
            message: 'success',
            content: data.content,
            id: data.id
        });
    }catch(e){
        throw err;
    }
});

router.post('/products/ajax_comment/delete', async (req, res) => {
    const {comment_id} = req.body;

    try{
        await CommentsModel.remove({id: comment_id});
        res.json({
            message: 'success'
        });
    }catch(err){
        throw err;
    }
});

module.exports = router;