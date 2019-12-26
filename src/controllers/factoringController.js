const myToolkit = require('../controllers/myToolkit');
const response = require('../controllers/myResponse');
const queryHelper = require("./sfHelpers/queryHelper");
const sfAttachments = require("./sfAttachments");
const jsonResHelper = require("./sfHelpers/jsonResHelper");
const _ = require('lodash');

async function submitFactoring(req, res, next){
    let resBody = {};

    // Get SF Connection Object, and check if it fails or not.
    const sfConn = await myToolkit.makeSFConnection();
    if (sfConn == null) {
        resBody = response(false, null, 500, 'Error occured when logging in salesforce.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
    if (factoringRecordTypeId == null || factoringRecordTypeId == '') {
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }

    // Do CRUD Operation in SF.
    resBody = await insertFactoringInSf(sfConn, req, res, factoringRecordTypeId);
    if (resBody.success == true) {
        res.status(200).send(resBody);
    } else {
        res.status(resBody.statusCode).send(resBody);
    }

    res.body = resBody;
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



async function getCustomerFactoringApplications(req, res, next) {
    let resBody;
    const wantedKeys = ["Id", "Name", "StageName", "CreatedDate", "CloseDate", "Type",
                                "Opportunity_Number__c", "LeadSource"];
    
    // Get SF Connection Object, and check if it fails or not.
    const sfConn = await myToolkit.makeSFConnection();
    if (sfConn == null) {
        resBody = response(false, null, 500, 'Error occured when logging in salesforce.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
    if (factoringRecordTypeId == null || factoringRecordTypeId == '') {
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }
    
    // Do core operations
    let factoringRecords;
    
    try{    
        // Get Factoring Opp of a given Customer
        factoringRecords = await getCustomerFactoringRecordsFromSf(req.query.customerId, factoringRecordTypeId, sfConn);

        if (factoringRecords == null) {
            resBody = response(false, null, 500, 'Something Wents Wrong When Getting Customer Factoring Records. Please Try Again.');
            res.status(500).send(resBody);
        } else {
            let finalResult = factoringRecords.map(item => _.pick(item, wantedKeys));

            resBody = jsonResHelper.refineJsonResponseKeys(response(true, finalResult, 200));
            res.status(200).send(resBody);
        }
        
        res.body = resBody;
        return next();
        
    } catch (e) {
        resBody = response(false, null, 500, 'Something Wents Wrong.', [{message: e.message}]);
        res.status(500).json(resBody);
        console.log(e);
        res.body = resBody;
        return next();
    } 
}

async function getCustomerFactoringRecordsFromSf(customerId, factoringRecordTypeId = undefined, sfConn = undefined){
    if (sfConn == undefined) {
        sfConn = await myToolkit.makeSFConnection();
        if (sfConn == null) {
            return null;
        }
    }

    if (factoringRecordTypeId == undefined){
        factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
        if (factoringRecordTypeId == null) {
            return null;
        }
    }

    let where = "PrimaryContact__r.Personal_Identity_Number__c = '" + customerId + "'" +
                    "AND recordTypeId = '" + factoringRecordTypeId + "'";
    
    let factoringRecords = await queryHelper.getQueryResult(sfConn, "Opportunity", where);

    return factoringRecords;
}


async function openFactoringOpp(req, res, next){
    let resBody;
    
    // Get SF Connection Object, and check if it fails or not.
    const sfConn = await myToolkit.makeSFConnection();
    if (sfConn == null) {
        resBody = response(false, null, 500, 'Error occured when logging in salesforce.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
    if (factoringRecordTypeId == null || factoringRecordTypeId == '') {
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }
    
    // Do core operations
    let factoringRecords, recordIds, files;
    try{        
        // Get Factoring Opp of a given Customer
        factoringRecords = await getFacoringExtendedDetailsById(req.query.oppId, factoringRecordTypeId, sfConn);
        if (factoringRecords == null) {
            resBody = response(false, null, 500, 'Something Wents Wrong When Getting Factoring Extended Details. Please Try Again.');
            res.status(500).send(resBody);
            res.body = resBody;
            return next();
        }
        
        recordIds = factoringRecords.map(item => item.Id);

        if (recordIds.length){
            try{
                files = await sfAttachments.getAttachedFilesinfo(recordIds, sfConn);
                if (files == null) {
                    resBody = response(false, null, 500, 'Something Wents Wrong When Getting Attached Files of Record. Please Try Again.');
                    res.status(500).send(resBody);
                    res.body = resBody;
                    return next();
                }

                
                factoringRecords.forEach(item => {
                   item.files = files[item.Id];
                });
                
                resBody = jsonResHelper.refineJsonResponseKeys(response(true, factoringRecords[0], 200));
                res.status(200).send(resBody);
            } catch (e) {
                console.log(e);
                resBody = response(false, null, 500, 'Something Wents Wrong When Getting Attached Files of Record. Please Try Again.', [e]);
                res.status(500).send(resBody);
            }

            res.body = resBody;
            return next();
        }
        
    } catch (e) {
        resBody = response(false, null, 500, 'Something Wents Wrong When Getting Factoring Extended Details. Please Try Again.', [e]);
        res.status(500).send(resBody);
        res.body = resBody;
        return;
    }
}


async function getFacoringExtendedDetailsById(oppId, factoringRecordTypeId = undefined, sfConn = undefined){
    console.log("getFacoringExtendedDetailsById");
    if (sfConn == undefined) {
        sfConn = await myToolkit.makeSFConnection();
        if (sfConn == null) {
            return null;
        }
    }

    if (factoringRecordTypeId == undefined){
        factoringRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Factoring');
        if (factoringRecordTypeId == null) {
            return null;
        }
    }

    let where = {
        recordTypeId : factoringRecordTypeId,
        Id : oppId
    };
    
    let factoringRecords = await queryHelper.getQueryResult(sfConn, "Opportunity", where);

    return factoringRecords;
}

// exports.submitFactoring = submitFactoring;

module.exports = {
    submitFactoring,
    getCustomerFactoringApplications,
    openFactoringOpp
}