var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/scan_barcode', function(req, res, next) {
  res.render('scan_barcode', { title: 'Scan Barcode' });
});

router.get('/show/:id', function(req, res, next) {
  res.render('show', { title: 'Patients Home Page' });
});
module.exports = router;
