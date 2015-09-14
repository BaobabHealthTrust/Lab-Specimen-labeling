var express = require('express');
var router = express.Router();
var loadUser = require('../force_login');

/* GET home page. */
router.get('/', loadUser, function(req, res, next) {
  res.render('index', { title: 'Express' , layout: 'layout' });
});

module.exports = router;
