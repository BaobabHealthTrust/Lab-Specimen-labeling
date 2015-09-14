var express = require('express');
var router = express.Router();
var loadUser = require('../force_login');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/scan_barcode', loadUser, function (req, res, next) {
    res.render('scan_barcode', {title: 'Scan Barcode'});
});

router.get('/show/:identifier?', loadUser, function (req, res, next) {
    res.render('show', {title: 'Patients Home Page'});
});

module.exports = router;
