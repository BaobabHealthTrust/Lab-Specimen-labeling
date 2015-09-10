var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login page' });
});

router.post('/process_authentication', function(request, response){
    var username = request.body.username;
    var password = request.body.password;
    console.log('Username = ' + username + '&password=' + password);

});
module.exports = router;
