const response = require("../controllers/myResponse");
const bodyParser = require("body-parser");
const _ = require('lodash');

async function getRecordTypeId(sfConn, sObjName, recordTypeName){
    let result;
    
    try{
        let sObjDescribe = await sfConn.sobject(sObjName).describe();
        let recordTypesList = sObjDescribe.recordTypeInfos;
        result = recordTypesList.find(o => o.name === recordTypeName).recordTypeId;
    } catch(err) {
        result = null;
    }

    return result;

    // sfConn.sobject(sObjName).describe(function(err, ret){
    //     console.log(err);
    //     let recordTypesList = ret.recordTypeInfos;
    //     let result = recordTypesList.find(o => o.name === recordTypeName);
        
    //     return result.recordTypeId;
    // });

}

function isJSON(req, res, next){
    bodyParser.json()(req, res, err => {
        if (err) {
            let jsonRes = response(false, null, 400, "Invalid JSON.");
            return res.status(400).send(jsonRes); // Bad request
        }

        next();
    });
}


function fixPhoneNumber(phone){
    let result = '';
    if (phone.startsWith('00')){
        result = '+' + phone.slice(2);
    } else if (phone.startsWith('0')){
        result = '+46' + phone.slice(1);
    } else {
        // phone must be start with +46
        result = phone;
    }

    return result;
}



module.exports = {
    getRecordTypeId,
    isJSON,
    fixPhoneNumber
}