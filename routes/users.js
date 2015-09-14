var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var loadUser = require('../force_login');
var bartConfig = require('../bart_config');
var bartHost = bartConfig.host;
var bartPort = bartConfig.port;
client = new Client();
var bartAddress = "http://" + bartHost + ':' + bartPort + "/single_sign_on/get_token"

router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/login', function (req, res, next) {
    authentication_status = req.session.authenticated;
    bart_error = req.session.bart_error;
    logged_out = req.session.logged_out;
    req.session.destroy();
    //req.session.authenticated = null;
    //req.session.bart_error = null;
    //req.session.logged_out = null;
    res.render('login', {title: 'Login page', authenticated: authentication_status});
});

router.get('/logout', function (req, res, next) {
    req.session.logged_out = 'true';
    req.session.session_user_id = null;
    res.redirect('/users/login');
});

router.post('/process_authentication', function (request, response) {

    var username = request.body.username;
    var password = request.body.password;
    var args = {
        data: {login: username, password: password},
        headers: {"Content-Type": "application/json"}
    };
    client.post(bartAddress, args, function (data, res) {
        var resp = JSON.parse(data);
        var authToken = resp.auth_token;
        if (authToken.length > 0) {
            //User is authenticated
            //Need to create some sessions here
            request.session.session_user_id = Math.floor((Math.random() * 100) + 1); //Return a random number between 1 and 100:
            response.redirect('/patients/scan_barcode');
        }
        else {
            //User is not authenticated
            request.session.authenticated = false
            response.redirect('/users/login');
        }
        //console.log(response);
    }).on('error', function (err) {
        //URL not found
        request.session.bart_error = 'true';
        response.redirect('/users/login');
    });
    ;
    //console.log('Username = ' + username + '&password=' + password);

});

module.exports = router;
