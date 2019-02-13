const express = require('express');
const router = express.Router();
const CheckoutModel = require('../models/CheckoutModel');

const {Iamporter, IamporterError} = require('iamporter');
const iamporter = new Iamporter({
    apiKey: '',
    secret: ''
});

router.get('/', (req, res) => {
    let totalAmount = 0;
    let cartList = {};

    if(typeof req.cookies.cartList !== 'undefined'){
        cartList = JSON.parse(unescape(req.cookies.cartList));

        for(let key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
    }
    res.render('checkout/index', {cartList: cartList, totalAmount: totalAmount});
});

// router.post('/complete', async (req, res) => {
//     const checkout = new CheckoutModel({
//         imp_uid : req.body.imp_uid,
//         merchant_uid : req.body.merchant_uid,
//         paid_amount : req.body.paid_amount,
//         apply_num : req.body.apply_num,
//
//         buyer_email : req.body.buyer_email,
//         buyer_name : req.body.buyer_name,
//         buyer_tel : req.body.buyer_tel,
//         buyer_addr : req.body.buyer_addr,
//         buyer_postcode : req.body.buyer_postcode,
//
//         status : req.body.status
//     });
//
//     try{
//         await checkout.save();
//
//         res.json({
//             message: 'success'
//         });
//     }catch(err){
//         throw err;
//     }
// });

router.get('/complete', async (req, res) => {
    try{
        const payData = await iamporter.findByImpUid(req.query.imp_uid);
        const checkout = new CheckoutModel({
            imp_uid : payData.imp_uid,
            merchant_uid : payData.merchant_uid,
            paid_amount : payData.paid_amount,
            apply_num : payData.apply_num,

            buyer_email : payData.buyer_email,
            buyer_name : payData.buyer_name,
            buyer_tel : payData.buyer_tel,
            buyer_addr : payData.buyer_addr,
            buyer_postcode : payData.buyer_postcode,

            status : '결제완료'
        });

        await checkout.save();

        res.redirect('/checkout/success');
    }catch(err){
        throw err;
    }
});

router.post('/mobile_complete', async (req, res) => {
    const checkout = new CheckoutModel({
        imp_uid : req.body.imp_uid,
        merchant_uid : req.body.merchant_uid,
        paid_amount : req.body.paid_amount,
        apply_num : req.body.apply_num,

        buyer_email : req.body.buyer_email,
        buyer_name : req.body.buyer_name,
        buyer_tel : req.body.buyer_tel,
        buyer_addr : req.body.buyer_addr,
        buyer_postcode : req.body.buyer_postcode,

        status : req.body.status
    });

    try{
        await checkout.save();

        res.json({
            message: 'success'
        });
    }catch(err){
        throw err;
    }
});

router.get('/success', (req, res) => {
    res.render('checkout/success');
});

router.get('/nomember', (req, res) => {
    res.render('checkout/nomember');
});

router.get('/nomember/search', async (req, res) => {
    try{
        const checkoutList = await CheckoutModel.find({email: req.query.email});
        res.render('checkout/search', {checkoutList: checkoutList});
    }catch(err){
        throw err;
    }
});

module.exports = router;