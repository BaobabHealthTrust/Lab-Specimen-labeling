var bookshelf = require('../db/bookshelf');

var LabParameter = bookshelf.Model.extend({
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
    tableName: 'LabTestTable',//,
    //idAttribute: ['AccessionNum', 'TestOrdered'],
    idAttribute: 'AccessionNum'
});

var LabTestType = bookshelf.Model.extend({
    tableName: 'codes_TestType',
    idAttribute: 'ID'
});

var Lab = bookshelf.Model.extend({
    tableName: 'map_lab_panel'
});

var LabPanel = bookshelf.Model.extend({
    tableName: 'map_lab_panel'
});

models = {LabParameter: LabParameter, LabSample: LabSample, LabTestTable: LabTestTable,
    LabTestType: LabTestType, Lab: Lab, LabPanel: LabPanel};

module.exports = models;
