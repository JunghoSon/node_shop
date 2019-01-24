const express = require('express');
const router = express.Router();

const ProductsModel = require('../models/ProductsModel');
const CommentsModel = require('../models/CommentsModel');

const csrf = require('csurf');
const csrfProtection = csrf({cookie: true});

const fs = require('fs');
const path = require('path');
const uploadDir = path.join(__dirname, '../uploads');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDir);
    },
    filename: (req, file, callback) => {
        callback(null, `products-${Date.now()}.${file.mimetype.split('/')[1]}`);
    }
});
const upload = multer({storage: storage});

const loginRequired = require('../libs/loginRequired');

router.get('/', (req, res) => {
    res.send('admin page');
});

router.get('/products', async (req, res) => {
    try{
        const results = await ProductsModel.find({});

        res.render('admin/products', {products: results});
    }catch(err){
        throw err;
    }
});

router.get('/products/write', loginRequired, csrfProtection, (req, res) => {
    res.render('admin/form', {product: {}, csrfToken: req.csrfToken()});
});

router.post('/products/write', loginRequired, upload.single('thumbnail'), csrfProtection, async (req, res) => {
    const {name, price, description} = req.body;

    try{
        const product = new ProductsModel({
            name, price, description,
            thumbnail: req.file ? req.file.filename : '',
            username: req.user.username
        });

        if(!product.validateSync()){
            await product.save();

            res.redirect('/admin/products');
        }
    }catch(err){
        throw err;
    }
});

router.get('/products/detail/:id', async (req, res) => {
    const {id} = req.params;

    try{
        const product = await ProductsModel.findOne({id: id});
        const comments = await CommentsModel.find({product_id: id});

        res.render('admin/productDetail', {product, comments});
    }catch(err){
        throw err;
    }
});

router.get('/products/edit/:id', loginRequired, csrfProtection, async (req, res) => {
    const {id} = req.params;

    try{
        const product = await ProductsModel.findOne({id: id});

        res.render('admin/form', {product: product, csrfToken: req.csrfToken()});
    }catch(err){
        throw err;
    }
});

router.post('/products/edit/:id', loginRequired, upload.single('thumbnail'), csrfProtection, async (req, res) => {
    const {id} = req.params;
    const {name, price, description} = req.body;

    try{
        const originalProduct = await ProductsModel.findOne({id: id});

        if(req.file && originalProduct.thumbnail){
            fs.unlinkSync(`${uploadDir}/${originalProduct.thumbnail}`);
        }

        const query = {
            name, price, description,
            thumbnail: req.file ? req.file.filename : originalProduct.thumbnail
        };

        const product = new ProductsModel(query);

        if(!product.validateSync()){
            const product = await ProductsModel.update({id: id}, {$set: query});

            res.redirect(`/admin/products/detail/${id}`);
        }
    }catch(err){
        throw err;
    }
});

router.get('/products/delete/:id', async (req, res) => {
    const {id} = req.params;

    try{
        await ProductsModel.remove({id: id});

        res.redirect('/admin/products');
    }catch(err){
        throw err;
    }
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
    }catch(err){
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