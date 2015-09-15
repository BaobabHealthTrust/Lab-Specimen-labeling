var express = require('express');
var router = express.Router();
var loadUser = require('../force_login');
var Client = require('node-rest-client').Client;
client = new Client();
var bartConfig = require('../bart_config');
var bartHost = bartConfig.host;
var bartPort = bartConfig.port;
var bartAddress = "http://" + bartHost + ':' + bartPort + "/people/remote_demographics"

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/scan_barcode', /*loadUser,*/ function (req, res, next) {
    patient_not_found = req.session.patient_not_found;
    patient_not_found = req.session.patient_not_found;
    req.session.patient_not_found = null;
    res.render('scan_barcode', {title: 'Scan Barcode', patient_not_found: patient_not_found});
});
var emptyObject = 'hhh';
router.get('/show/:identifier?', /*loadUser,*/ function (req, res, next) {
    patientIdentifier = req.query.identifier;

    data = {person: {value: patientIdentifier}};
    //console.log(data);
    var args = {
        data: data,
        headers: {"Content-Type": "application/json"}
    };
    
    client.post(bartAddress, args, function (data, resp) {
        emptyObject = 'k'
        var person = JSON.parse(data);
        if (isEmpty(person) === true) {
            res.redirect("/patients/scan_barcode");            
        }
        
        else {
            personAddress = person["person"]["addresses"];
            personAttributes = person["person"]["attributes"];
            personNames = person["person"]["names"];
            patientIdentifiers = person["person"]["patient"]["identifiers"];
            gender = person["person"]["gender"];
            birthDay = person["person"]["birth_day"];
            birthMonth = person["person"]["birth_month"];
            birthYear = person["person"]["birth_year"];
            
            res.render('show', {title: 'Patients Home Page', personAddress: personAddress,
            personAttributes: personAttributes, personNames: personNames,
            patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
            birthMonth: birthMonth, birthYear: birthYear
        });
        }
    }).on('error', function (err) {
        console.log('Error')
        //URL not found
        //response.redirect('/users/login');
    });

});

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
module.exports = router;
