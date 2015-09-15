var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var patients = require('./routes/patient');
/*var bookshelf = require('./db/bookshelf');*/
var app = express();

// view engine setup
app.engine('.html', require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))

app.use('/', routes);
app.use('/users', users);
app.use('/users/login', users);
app.use('/users/logout', users);
app.use('/users/process_authentication', patients);
app.use('/patients', patients);
app.use('/patients/scan_barcode', patients);
app.use('/patients/show/:identifier?', patients);
app.use('/patients/new_lab_results/:identifier', patients);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/*var LabParameter = bookshelf.Model.extend({
    tableName: 'Lab_Parameter',
    idAttribute: 'ID',
    lab_samples: function () {
        return this.belongsTo(LabSample);
    }
});

var LabSample = bookshelf.Model.extend({
    tableName: 'Lab_Sample',
    idAttribute: 'Sample_ID',
    lab_parameters: function () {
        return this.hasMany(LabParameter);
    }
});

var LabTestTable = bookshelf.Model.extend({
    tableName: 'LabTestTable',
    idAttribute: ['AccessionNum', 'TestOrdered']
});

var LabTestType = bookshelf.Model.extend({
    tableName: 'codes_TestType',
    idAttribute: 'ID'
});

var Lab = bookshelf.Model.extend({
    tableName: 'map_lab_panel'
});*/

/*new Lab({rec_id: 26})
 .fetch()
 .then(function(model) {
 console.log(model);
 });*/

module.exports = app;
