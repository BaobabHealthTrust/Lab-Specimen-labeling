var express = require('express');
var router = express.Router();
var Client = require('node-rest-client').Client;
var model = require('../models/healthData');
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

    password = request.body.password;
    LabTestType = model.LabTestType;
    LabTestTable = model.LabTestTable;
    LabPanel = model.LabPanel;
    LabSample = model.LabSample;
    LabParameter = model.LabParameter;
    Clinician = model.Clinician;

    new Clinician({Clinician_ID: password}).fetch().then(function (user) {
        if (user) {
            request.session.session_user_id = user.get('Clinician_ID');
            request.session.user = user.toJSON()
            response.redirect('/patients/scan_barcode');
        }
        else {
            request.session.authenticated = false;
            response.redirect('/users/login');
        }
    })

});

module.exports = router;
