const express = require('express');
const paginate = require('express-paginate');
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

router.get('/products', paginate.middleware(5, 50), async (req, res) => { //한번에 보여줄 리스트 갯수, 한번에 보여줄 리스트 최대 갯수
    try{
        const [results, itemCount] = await Promise.all([
            ProductsModel.find().sort({id: -1}).limit(req.query.limit).skip(req.skip).exec(),
            ProductsModel.count({})
        ]);

        const pageCount = Math.ceil(itemCount/req.query.limit);
        const pages = paginate.getArrayPages(req)(2, pageCount, req.query.page); //한 화면에 보여줄 페이지 갯수, 총 페이지 수, 현재 페이지

        res.render('admin/products', {products: results, pages, pageCount});
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
            console.log(Date.now());
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

// const co = require('co');
//
// router.get('/products/detail/:id', async (req, res) => {
//     const {id} = req.params;
//
//     const getData = co(function* (){
//         const product = yield ProductsModel.findOne({id: id});
//         const comments = yield CommentsModel.find({product_id: id});
//
//         return {
//             product: product,
//             comments: comments
//         }
//     });
//
//     getData.then(result => {
//         res.render('admin/productDetail', {product: result.product, comments: result.comments});
//     });
// });

// router.get('/products/detail/:id', async (req, res) => {
//     const {id} = req.params;
//
//     const getData = co(function* (){
//         return {
//             product: yield ProductsModel.findOne({id: id}),
//             comments: yield CommentsModel.find({product_id: id})
//         }
//     });
//
//     getData.then(result => {
//         res.render('admin/productDetail', {product: result.product, comments: result.comments});
//     });
// });

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