const myToolkit = require('../controllers/myToolkit');
const response = require('../controllers/myResponse');

async function submitFactoring(req, res, next){
    let resBody = {};

    // Get SF Connection Object, and check if it fails or not.
    const sfConn = await myToolkit.makeSFConnection();
    if (sfConn == null) {
        res.status(500).send("Error occured when logging in salesforce.");
        return next();
    }

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
    if (factoringRecordTypeId == null || factoringRecordTypeId == '') {
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        res.status(500).send(resBody);
        return next();
    }

    // Do CRUD Operation in SF.
    resBody = await insertFactoringInSf(sfConn, req, res, factoringRecordTypeId);
    if (resBody.success == true) {
        res.status(200).send(resBody);
    } else {
        res.status(resBody.statusCode).send(resBody);
    }

    // Give Control to next middleware, if exist.
    return next();

}

async function insertFactoringInSf(sfConn, req, res, factoringRecordTypeId){
    // Prepare Payload
    let payload = {
        recordTypeId: factoringRecordTypeId,
        name: req.body.name,
        LeadSource: req.body.leadsource,
        Type: 'New Business',
        stageName: 'App Received',
        Need__c: req.body.need.join(';'),
        UTM_Source__c: req.body.utm_source,
        UTM_Medium__c: req.body.utm_medium,
        UTM_Campaign__c: req.body.utm_campaign,
        Referral_ID__c: req.body.referral_id,
        Last_Referral_Date__c: req.body.last_referral_date,
        CloseDate: Date.now()
    };


    // Insert in SF, and prepare responses
    try{
        const factoringOpp = await sfConn.sobject("Opportunity").create(payload);
        
        if (factoringOpp.success){
            return response(true, {id: factoringOpp.id}, 200, 'Factoring Submitted.');
        } else {
            return response(false, null, 500, 'Something Wents Wrong. Please Try Again.');
        }

    } catch(err) {
        return response(false, null, 500, 'Error Occured When Creating Lead.', [err]);
    }


}



exports.submitFactoring = submitFactoring;