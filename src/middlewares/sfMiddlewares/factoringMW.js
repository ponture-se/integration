const myToolkit = require('../../controllers/myToolkit');
const commonMW = require('./commonMW');

async function getFacoringRecordTypeId(req, res, next) {
    const sObject = "Opportunity",
            recordTypeName = "Factoring";
    
    commonMW.setRecordTypeInReq(sObject, recordTypeName, req, res, next);
}

module.exports = {
    getFacoringRecordTypeId
}