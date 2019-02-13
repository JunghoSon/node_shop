const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    let totalAmount = 0;
    let cartList = {};

    if(typeof req.cookies.cartList !== 'undefined'){
        cartList = JSON.parse(unescape(req.cookies.cartList));

        for(let key in cartList){
            totalAmount += parseInt(cartList[key].amount);
        }
    }

    res.render('cart/index', {cartList, totalAmount});
});

module.exports = router;