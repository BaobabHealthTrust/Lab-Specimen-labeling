var express = require('express');
var router = express.Router();
var model = require('../models/healthData');
var knex = require('../db/bookshelf').knex;
var loadUser = require('../force_login');
var Client = require('node-rest-client').Client;
client = new Client();
var bartConfig = require('../bart_config');
var tests = require('../tests');
var bartHost = bartConfig.host;
var bartPort = bartConfig.port;
var facilityName = bartConfig.facilityName;
var bartAddress = "http://" + bartHost + ':' + bartPort + "/people/remote_demographics"
var fs = require('fs');
/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.get('/scan_barcode', loadUser, function (req, res, next) {
    //patient_not_found = req.session.patient_not_found;
    patient_not_found = req.session.patient_not_found;
    req.session.person = {};
    req.session.patient_not_found = null;
    res.render('scan_barcode', {title: 'Scan Barcode', patient_not_found: patient_not_found});
});

router.get('/show/:identifier?', loadUser, function (req, res, next) {

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

        /*for (var test in testsOrdered) {
         array.push([testsOrdered[test].AccessionNum, testsOrdered[test].TestOrdered, testsOrdered[test].OrderDate,
         testsOrdered[test].OrderTime, testsOrdered[test].OrderedBy]
         );
         }
         
         testsOrdered = arrayGroup(array, 4);
         testsOrdered = JSON.stringify(testsOrdered)*/

        var print_url = '';
        var multiple_print_urls;

        if (req.session.print_url) {
            print_url = req.session.print_url;
            req.session.print_url = null;
        }
        //multiple_print_urls
        if (req.session.multiple_print_urls) {
            multiple_print_urls = req.session.multiple_print_urls;
            req.session.multiple_print_urls = null;
        }

        res.render('show', {title: 'Patients Home Page', personAddress: personAddress,
            personAttributes: personAttributes, personNames: personNames,
            patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
            birthMonth: birthMonth, birthYear: birthYear, age: age, testsOrdered: testsOrdered,
            printUrl: print_url, multiplePrintUrls: multiple_print_urls
        });

    });

});

router.get('/confirm/:identifier?', loadUser, function (req, res, next) {
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

            knex('LabTestTable').where({Pat_ID: patientIdentifiers['National id']}).limit(10).orderBy('OrderDate', 'desc').select(
                    'AccessionNum', 'TestOrdered', 'OrderDate', 'OrderTime', 'OrderedBy'
                    ).then(function (testsOrdered) {
                res.render('confirm', {title: 'Confirmation Page', personAddress: personAddress,
                    personAttributes: personAttributes, personNames: personNames,
                    patientIdentifiers: patientIdentifiers, gender: gender, birthDay: birthDay,
                    birthMonth: birthMonth, birthYear: birthYear, age: age, testsOrdered: testsOrdered
                });
            })
        }
    }).on('error', function (err) {
        console.log('Error')
        res.redirect("/patients/scan_barcode");

    });
})

router.get('/new_lab_results/:identifier', loadUser, function (req, res, next) {
    //monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    today = new Date();
    thisMonth = today.getMonth() + 1;
    if (thisMonth < 10) {
        thisMonth = '0' + thisMonth;
    }
    formattedDate = today.getFullYear() + '-' + thisMonth + '-' + today.getDate();
    patientIdentifier = req.params.identifier;

    res.render('new_lab_results', {title: 'New Lab Results', today: formattedDate,
        patientIdentifier: patientIdentifier, tests: tests});

    /*LabTestType = model.LabTestType;
     
     optionsForSelect = '<option value=""></option>\n';
     new LabTestType().fetchAll().then(function (models) {
     labTests = models.toJSON();
     labTestsProcessed = [];
     for (var i = 0; i <= labTests.length - 1; i++) {
     //We need to skip all records with panel_ID = 0 coz they don't have associated records
     Panel_ID = labTests[i].Panel_ID;
     if (parseInt(Panel_ID) === 0)
     continue;
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
     })*/
    //console.log(model.LabParameter)
    /*new Lab({rec_id: 26})
     .fetch()
     .then(function (model) {
     console.log(model);
     });*/
});

router.post('/process_lab_results', loadUser, function (request, response) {
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

    selected_tests = request.body["lab_orders[]"];

    knex.table('LabTestTable').max('AccessionNum as AccessionNum').then(function (maxValue) {
        AccessionNum = maxValue[0]["AccessionNum"];
        data = [];
        accession_test = {}
        multiple_print_urls = [];
        for (var i = 0; i <= selected_tests.length - 1; i++) {
            if (selected_tests[i].length > 0) {
                AccessionNum = AccessionNum + 1;
                short_name = tests["short_names"][selected_tests[i]];
                if (!short_name) {
                    short_name = selected_tests[i];
                }
                accession_test[AccessionNum] = short_name;
                data.push({
                    AccessionNum: AccessionNum,
                    TestOrdered: short_name,
                    Pat_ID: patientIdentifier,
                    OrderDate: today,
                    OrderTime: orderTime,
                    OrderedBy: userId,
                    Location: facilityName
                });

                print_url = "/patients/download_order?identifier=" + patientIdentifier + '&accessionNum=' + AccessionNum + '&testOrdered=' + encodeURIComponent(short_name);
                multiple_print_urls.push(print_url);
            }
        }

        knex.insert(data).into("LabTestTable").returning('AccessionNum').then(function (acc_num) {
            acc_num = Object.keys(accession_test)[Object.keys(accession_test).length - 1];
            testShortName = accession_test[acc_num] //Last Test

            url = "/patients/download_order?identifier=" + patientIdentifier + '&accessionNum=' + acc_num + '&testOrdered=' + encodeURIComponent(testShortName);
            request.session.print_url = url;
            request.session.multiple_print_urls = multiple_print_urls;
            response.redirect("/patients/show/" + patientIdentifier);
        })
    })
    /*knex.table('LabTestTable').max('AccessionNum as AccessionNum').then(function (maxValue) {
     
     })*/
    /*knex.table('LabTestTable').max('AccessionNum as AccessionNum').then(function (maxValue) {
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
     //src="/patients/download_order?identifier=<%= patientIdentifier %>&accessionNum=<%= accessionNum %>&testOrdered=<%= testOrdered %>"
     url = "/patients/download_order?identifier=" + patientIdentifier + '&accessionNum=' + AccessionNum + '&testOrdered=' + encodeURIComponent(testShortName);
     request.session.print_url = url;
     response.redirect("/patients/show/" + patientIdentifier);
     })
     ;
     });
     });
     });*/
})

router.post('/delete_orders', loadUser, function (request, response) {
    AccessionNum = request.body.accessionNum;
    TestOrdered = request.body.testOrdered;
    LabTestTable = model.LabTestTable;
    console.log("AccessionNum = " + AccessionNum + " TestOrdered = " + TestOrdered);
    /*knex('LabTestTable').where({AccessionNum: AccessionNum, TestOrdered: TestOrdered}).then(function (testOrdered) {
     testOrdered.del()
     response.send('Deleted Successfully');
     })*/

    /*var query = knex('LabTestTable')
     .where({AccessionNum: AccessionNum, TestOrdered: TestOrdered})
     .del();
     console.log(query.toString())*/
    new LabTestTable({AccessionNum: AccessionNum, TestOrdered: TestOrdered})
            .destroy()
            .then(function (model) {
                response.send('Deleted Successfully');
            });
})

router.get('/manage_orders/:identifier', loadUser, function (req, res, next) {
    patientIdentifier = req.params.identifier;
    knex('LabTestTable').where({Pat_ID: patientIdentifier}).select(
            'AccessionNum', 'TestOrdered', 'OrderDate', 'OrderTime', 'OrderedBy'
            ).then(function (testsOrdered) {
        //testsOrdered = JSON.stringify(testsOrdered);
        res.render('manage_orders', {testsOrdered: testsOrdered, patientIdentifier: patientIdentifier});
    });
});

router.get('/print_orders/:identifier?', loadUser, function (req, res, next) {
    patientIdentifier = req.query.identifier;
    testOrdered = req.query.testOrdered;
    accessionNum = req.query.accessionNum;
    res.render('print_orders', {title: 'Print Order', accessionNum: accessionNum, testOrdered: testOrdered, patientIdentifier: patientIdentifier});
});

router.get('/download_order/:identifier?', loadUser, function (req, res, next) {
    patientIdentifier = req.query.identifier;
    testName = req.query.testOrdered;
    accessionNum = req.query.accessionNum;
    person = req.session.person;
    personNames = person["person"]["names"];
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

    name = personNames["given_name"] + ' ' + personNames["family_name"] + "(" + age + ")"
        ' (' + patientIdentifier + ')(' + gender + ')';
    knex('LabTestTable').where({Pat_ID: patientIdentifier, AccessionNum: accessionNum, TestOrdered: testName}).select(
            'AccessionNum', 'TestOrdered', 'OrderDate', 'OrderTime', 'OrderedBy'
            ).then(function (testOrdered) {

        orderDate = testOrdered[0].OrderDate;
        orderTime = testOrdered[0].OrderTime;
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        date = new Date(orderDate)
        month = months[date.getMonth()];
        dateTimeOrdered = date.getDate() + '/' + month + '/' + date.getFullYear() + ' ' + orderTime;
        fname = new Date().getTime() + '.lbl'
        fileName = '/tmp/' + fname;
        var data = "\nN\n" +
                "q500\n" +
                "Q145,026\n" +
                "ZT\n" +
                "B50,119,0,1,4,8,50,N,\"" + accessionNum + "\"\n" +
                "A35,50,0,2,1,1,N,\"" + name + "\"\n" +
                "A35,70,0,2,1,1,N,\"Acc no  " + accessionNum + "\"\n" +
                "A35,90,0,2,1,1,N,\"Order " + testName + "\"\n" +
                "A35,110,0,2,1,1,N,\"" + dateTimeOrdered + "\"\n" +
                "P3\n\n"

        fs.writeFile(fileName, data, function (err) {
            var path = require('path');
            var mime = require('mime');
            //res.download(fileName);
            var file = fileName;

            var filename = path.basename(file);
            var mimetype = mime.lookup(file);
            res.setHeader('Content-disposition', 'inline; filename=' + fname);
            res.setHeader('Content-type', 'application/label; charset=utf-8');
            res.setHeader('stream', false);

            var filestream = fs.createReadStream(file);
            filestream.on('open', function () {
                // This just pipes the read stream to the response object (which goes to the client)
                filestream.pipe(res);
            });

            //filestream.pipe(res);
        });
    });
});

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
