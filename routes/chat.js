const express = require('express');
const router = express.Router();
const loginRequired = require('../libs/loginRequired');

router.get('/', loginRequired, (req, res) => {
    res.render('chat/index');
});

module.exports = router;