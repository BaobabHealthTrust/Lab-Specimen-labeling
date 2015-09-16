var express = require('express');
var router = express.Router();
var model = require('../models/healthData');
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
            if (birthDay === 'Unknown')
                birthDay = 1;
            if (birthMonth === 'Unknown')
                birthMonth = 7;

            birthdate = new Date(parseInt(birthYear), parseInt(birthMonth) - 1, parseInt(birthDay));
            age = getAge(birthdate);

            res.render('show', {title: 'Patients Home Page', personAddress: personAddress,
                personAttributes: personAttributes, personNames: personNames,
                patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
                birthMonth: birthMonth, birthYear: birthYear, age: age
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
    //monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    today = new Date();
    thisMonth = today.getMonth() + 1;
    if (thisMonth < 10) {
        thisMonth = '0' + thisMonth;
    }
    formattedDate = today.getFullYear() + '-' + thisMonth + '-' + today.getDate();
    patientIdentifier = req.params.identifier;
    LabTestType = model.LabTestType;

    optionsForSelect = '<option value=""></option>\n';
    new LabTestType().fetchAll().then(function (models) {
        labTests = models.toJSON();
        labTestsProcessed = [];
        for (var i = 0; i <= labTests.length - 1; i++) {
            value = labTests[i].TestName;
            key = value.replace(/_/g, " ");
            labTestsProcessed.push([key, value]);
        }

        labTestsProcessed.sort(function (a, b) {
            var valueA = a[0].toLowerCase(), valueB = b[0].toLowerCase();
            if (valueA < valueB) //sort string ascending
                return -1;
            if (valueA > valueB)
                return 1;
            return 0 //default return value (no sorting)
        });

        for (var i = 0; i <= labTestsProcessed.length - 1; i++) {
            key = labTestsProcessed[i][0];
            value = labTestsProcessed[i][1];
            optionsForSelect += '<option value="' + value + '">' + key + '</option>\n';
        }

        res.render('new_lab_results', {title: 'New Lab Results', today: formattedDate,
            patientIdentifier: patientIdentifier, labTests: JSON.stringify(labTestsProcessed),
            optionsForSelect: optionsForSelect});
    })
    //console.log(model.LabParameter)
    /*new Lab({rec_id: 26})
     .fetch()
     .then(function (model) {
     console.log(model);
     });*/
});

router.post('/process_lab_results', function (request, response) {
    console.log(request.body)
    var labResult = request.body.lab_result;
    var testDate = request.body.test_date;
    var testValue = request.body.test_value;
    var patientIdentifier = request.body.patient_identifier;
    var test_modifier = labResult.match(/=|<|>/)[0];
    var test_value = labResult.replace(/>/g, '').replace(/</g, '').replace(/=/g, '');


    LabTestType = model.LabTestType;
    LabTestTable = model.LabTestTable;
    LabPanel = model.LabPanel;
    LabSample = model.LabSample;
    LabParameter = model.LabParameter;

    new LabTestTable({
        TestOrdered: '#',
        Pat_ID: '#',
        OrderTime: '#',
        OrderedBy: '#',
        Location: '#'
    }).save().then(function (lab_test_table) {
        new LabSample({
            AccessionNum: '#',
            USERID: '#',
            TESTDATE: '#',
            PATIENTID: '#',
            DATE: '#',
            TIME: '#',
            SOURCE: '#',
            DeleteYN: '#',
            Attribute: '#',
            TimeStamp: '#'
        }).save().then(function (lab_sample) {
            new LabParameter({
                Sample_ID: '#',
                TESTTYPE: '#',
                TESTVALUE: '#',
                TimeStamp: '#',
                Range: '#'
            }).save()
        })
    });
})

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
