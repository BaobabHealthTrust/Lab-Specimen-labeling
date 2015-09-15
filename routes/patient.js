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
    console.log('Not found = ' + req.session.patient_not_found);
    //patient_not_found = req.session.patient_not_found;
    patient_not_found = req.session.patient_not_found;
    req.session.patient_not_found = null;
    res.render('scan_barcode', {title: 'Scan Barcode', patient_not_found: patient_not_found});
});

router.get('/show/:identifier?', /*loadUser,*/ function (req, res, next) {
    patientIdentifier = req.query.identifier;

    data = {person: {value: patientIdentifier}};
    //console.log(data);
    var args = {
        data: data,
        headers: {"Content-Type": "application/json"}
    };
    
    client.post(bartAddress, args, function (data, resp) {
        var person = JSON.parse(data);
        if (isEmpty(person) === true) {
            req.session.patient_not_found = 'true'
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
            if (birthDay === 'Unknown') birthDay = 1;
            if (birthMonth === 'Unknown') birthMonth = 7;
            
            birthdate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
            age = getAge(birthdate);

            res.render('show', {title: 'Patients Home Page', personAddress: personAddress,
            personAttributes: personAttributes, personNames: personNames,
            patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
            birthMonth: birthMonth, birthYear: birthYear, age:age
        });
        }
    }).on('error', function (err) {
        console.log('Error')
        res.redirect("/patients/scan_barcode");      
        //URL not found
        //response.redirect('/users/login');
    });

});

router.get('/new_lab_results/:identifier', /*loadUser,*/ function (req, res, next) {
    res.render('new_lab_results', {title: 'New Lab Results'});
});

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function getAge(dateString) {
    var today = new Date();
    var birthDate = new Date(dateString);
    var age = today.getFullYear() - birthDate.getFullYear();
    var m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

module.exports = router;
