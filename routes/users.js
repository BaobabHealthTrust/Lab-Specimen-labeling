var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
client = new Client();

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function (req, res, next) {
    res.render('login', {title: 'Login page'});
});

router.post('/process_authentication', function (request, response) {

    var username = request.body.username;
    var password = request.body.password;
    var args = {
        data: {login: username, password: password},
        headers: {"Content-Type": "application/json"}
    };
    client.post("http://localhost:3001/single_sign_on/get_token", args, function (data, res) {
        var resp = JSON.parse(data);
        var authToken = resp.auth_token;
        if (authToken.length > 0){
            //User is authenticated
            //Need to create some sessions here
            console.log('User is successfully authenticated')
            response.redirect('/patients/scan_barcode');
        }
        else{
            //User is not authenticated
            console.log('User Authentication not successful')
            response.redirect('/users/login');
        }
        //console.log(response);
    });
    //console.log('Username = ' + username + '&password=' + password);

});
module.exports = router;
