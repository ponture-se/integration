const myToolkit = require('../../controllers/myToolkit');
const response = require("../../controllers/myResponse");
const apiLogger = require("../apiLogger");

async function setRecordTypeInReq(sobject, recordTypeName, req, res, next) {
    let resBody;

    const sfConn = req.needs.sfConn;

    if (!sfConn){
        resBody = response(false, null, 500, 'Connection to Salesforce Couldn\'t established.');
        res.status(500).send(resBody);
        res.body = resBody;
        
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    }

    // Get Record Type
    try {
        const recordTypeId = await myToolkit.getRecordTypeId(sfConn, sobject, recordTypeName);
    
        if (recordTypeId == null || recordTypeId == '') {
            resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
            res.status(500).send(resBody);
            res.body = resBody;
            
            return apiLogger(req, res, () => {return;});			//instead of calling next()
        } else {
            myToolkit.addPairToReqNeeds(req, 'recordTypeId', recordTypeId);
            return next();
        }
    } catch (err) {
        resBody = response(false, null, 500, 'Something went Wrong when getting recordTypeId of :' + sobject + ' - ' + recordTypeName);
        res.status(500).send(resBody);
        res.body = resBody;
        
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    }
}


module.exports = {
    setRecordTypeInReq
}