var express = require('express');
var router = express.Router();
var model = require('../models/healthData');
var knex = require('../db/bookshelf').knex;
var loadUser = require('../force_login');
var Client = require('node-rest-client').Client;
client = new Client();
var bartConfig = require('../bart_config');
var bartHost = bartConfig.host;
var bartPort = bartConfig.port;
var facilityName = bartConfig.facilityName;
var bartAddress = "http://" + bartHost + ':' + bartPort + "/people/remote_demographics"

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/scan_barcode', /*loadUser,*/ function (req, res, next) {
    //patient_not_found = req.session.patient_not_found;
    patient_not_found = req.session.patient_not_found;
    req.session.person = {};
    req.session.patient_not_found = null;
    res.render('scan_barcode', {title: 'Scan Barcode', patient_not_found: patient_not_found});
});

router.get('/show/:identifier?', /*loadUser,*/ function (req, res, next) {

    var person = req.session.person;
    if (isEmpty(person) === true) {
        req.session.patient_not_found = 'true'
        res.redirect("/patients/scan_barcode");
    }

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

    knex('LabTestTable').where({Pat_ID: patientIdentifiers['National id']}).select(
            'AccessionNum', 'TestOrdered', 'OrderDate', 'OrderTime', 'OrderedBy'
            ).then(function (testsOrdered) {
        array = []

        for (var test in testsOrdered) {
            array.push([testsOrdered[test].AccessionNum, testsOrdered[test].TestOrdered, testsOrdered[test].OrderDate,
                testsOrdered[test].OrderTime, testsOrdered[test].OrderedBy]
                    );
        }

        testsOrdered = arrayGroup(array, 4);
        testsOrdered = JSON.stringify(testsOrdered)

        res.render('show', {title: 'Patients Home Page', personAddress: personAddress,
            personAttributes: personAttributes, personNames: personNames,
            patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
            birthMonth: birthMonth, birthYear: birthYear, age: age, testsOrdered: testsOrdered
        });
    })

});

router.get('/confirm/:identifier?', /*loadUser,*/ function (req, res, next) {
    patientIdentifier = req.query.identifier;
    data = {person: {value: patientIdentifier}};
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
            req.session.person = person;

            res.render('confirm', {title: 'Confirmation Page', personAddress: personAddress,
                personAttributes: personAttributes, personNames: personNames,
                patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
                birthMonth: birthMonth, birthYear: birthYear, age: age
            });
        }
    }).on('error', function (err) {
        console.log('Error')
        res.redirect("/patients/scan_barcode");

    });
})

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
    var labResult = request.body.lab_result;
    var patientIdentifier = request.body.patient_identifier;
    var userId = request.session.session_user_id;

    today = new Date();
    minutes = today.getMinutes();
    if (parseInt(minutes) < 10) {
        minutes = '0' + minutes;
    }

    orderTime = today.getHours() + ':' + minutes + ':' + today.getSeconds();
    LabTestType = model.LabTestType;
    LabTestTable = model.LabTestTable;
    LabPanel = model.LabPanel;
    LabSample = model.LabSample;
    LabParameter = model.LabParameter;

    knex.table('LabTestTable').max('AccessionNum as AccessionNum').then(function (maxValue) {
        AccessionNum = maxValue[0]["AccessionNum"] + 1;
        new LabTestType({TestName: labResult}).fetch().then(function (lab_test_type) {
            Panel_ID = lab_test_type.get('Panel_ID');
            new LabPanel({rec_id: Panel_ID}).fetch().then(function (lab_panel) {
                testShortName = lab_panel.get('short_name');
                new LabTestTable({
                    AccessionNum: AccessionNum,
                    TestOrdered: testShortName,
                    Pat_ID: patientIdentifier,
                    OrderDate: today,
                    OrderTime: orderTime,
                    OrderedBy: userId,
                    Location: facilityName
                }).save(null, {method: 'insert'}).then(function (lab_test_table) {
                    //null, {method: 'insert'} forces knex to save a new record when PK is being tampered.
                    console.log('Record Successfully Saved');
                    console.log('Request = ' + request)
                    request.redirect("/patients/show/" + patientIdentifier);
                });
            });
        });
    });
})

function isEmpty(obj) {
    try {
        return Object.keys(obj).length === 0;
    }
    catch (e) {
        return true; //If it is non object, return true
    }
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

function arrayGroup(arr, maxPerGroup) {
    var result = [];
    var tempArr = [];
    for (var i = 1; i <= arr.length; i++) {
        tempArr.push(arr[i - 1]);
        if (i % maxPerGroup === 0) {
            result.push(tempArr);
            tempArr = [];
        }
    }

    if (tempArr.length > 0 && tempArr.length < maxPerGroup) {
        result.push(tempArr);
    }
    return result;
}
module.exports = router;
