const myToolkit = require('../controllers/myToolkit');
const myResponse = require('../controllers/myResponse');
const queryHelper = require("./sfHelpers/queryHelper");
const fileController = require("./fileController");
const jsonResHelper = require("./sfHelpers/jsonResHelper");
const _ = require('lodash');

async function submitFactoring(req, res, next){
    let resBody = {};

    // Get SF Connection Object
    const sfConn = req.needs.sfConn;

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = req.needs.recordTypeId;

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
            return myResponse(true, {id: factoringOpp.id}, 200, 'Factoring Submitted.');
        } else {
            return myResponse(false, null, 500, 'Something Wents Wrong. Please Try Again.');
        }

    } catch(err) {
        return myResponse(false, null, 500, 'Error Occured When Creating Lead.', [err]);
    }


}



async function getCustomerFactoringApplications(req, res, next) {
    let resBody;
    const wantedKeys = ["Id", "Name", "StageName", "CreatedDate", "CloseDate", "Type",
                                "Opportunity_Number__c", "LeadSource"];
    
    // Get SF Connection Object
    const sfConn = req.needs.sfConn;

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = req.needs.recordTypeId;
    
    // Do core operations
    let factoringRecords;
    
    try{    
        // Get Factoring Opp of a given Customer
        factoringRecords = await getCustomerFactoringRecordsFromSf(req.query.customerId, factoringRecordTypeId, sfConn);

        if (factoringRecords == null) {
            resBody = myResponse(false, null, 500, 'Something Wents Wrong When Getting Customer Factoring Records. Please Try Again.');
            res.status(500).send(resBody);
        } else {
            let finalResult = factoringRecords.map(item => _.pick(item, wantedKeys));

            resBody = jsonResHelper.refineJsonResponseKeys(myResponse(true, finalResult, 200));
            res.status(200).send(resBody);
        }
        
        res.body = resBody;
        return next();
        
    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Wents Wrong.', [{message: e.message}]);
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
    
    // Get SF Connection Object
    const sfConn = req.needs.sfConn;

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = req.needs.recordTypeId;
    
    // Do core operations
    let factoringRecords, recordIds, files;
    try{        
        // Get Factoring Opp of a given Customer
        factoringRecords = await getFacoringExtendedDetailsById(req.query.oppId, factoringRecordTypeId, sfConn);
        if (factoringRecords == null) {
            resBody = myResponse(false, null, 500, 'Something Wents Wrong When Getting Factoring Extended Details. Please Try Again.');
            res.status(500).send(resBody);
            res.body = resBody;
            return next();
        }
        
        recordIds = factoringRecords.map(item => item.Id);

        if (recordIds.length){
            try{
                files = await fileController.getAttachedFilesinfo(recordIds, sfConn);
                if (files == null) {
                    resBody = myResponse(false, null, 500, 'Something Wents Wrong When Getting Attached Files of Record. Please Try Again.');
                    res.status(500).send(resBody);
                    res.body = resBody;
                    return next();
                }

                
                factoringRecords.forEach(item => {
                   item.files = files[item.Id];
                });
                
                resBody = jsonResHelper.refineJsonResponseKeys(myResponse(true, factoringRecords[0], 200));
                res.status(200).send(resBody);
            } catch (e) {
                console.log(e);
                resBody = myResponse(false, null, 500, 'Something Wents Wrong When Getting Attached Files of Record. Please Try Again.', [e]);
                res.status(500).send(resBody);
            }

            res.body = resBody;
            return next();
        }
        
    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Wents Wrong When Getting Factoring Extended Details. Please Try Again.', [e]);
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }
}


async function getFacoringExtendedDetailsById(oppId, factoringRecordTypeId = undefined, sfConn = undefined){
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


async function cancelFactoringApp(req, res, next){
    let resBody;
    
    // Get SF Connection Object
    const sfConn = req.needs.sfConn;

    // Get 'Factoring' Record Type, and check if it fails or not.
    let factoringRecordTypeId = req.needs.recordTypeId;

    // Do core operations
    try{
        let records = await getFacoringExtendedDetailsById(req.query.oppId, factoringRecordTypeId, sfConn);
        if (records == null){
            resBody = myResponse(false, null, 500, "Something Went Wrong");
            res.status(500).send(resBody);
        } else if (!records.length) {
            resBody = myResponse(false, null, 404, "Nothing Found. 'oppId' may be incorrect.");
            res.status(404).send(resBody);
        } else {
            resBody = await cancelFactoringAppInSF(records[0], sfConn);
            res.status(resBody.statusCode).send(resBody);
        }

    } catch (e) {
        resBody = myResponse(false, null, 500, 'Something Wents Wrong When Canceling Factoring Opp. Please Try Again.', [e]);
        res.status(500).send(resBody);
    }

    res.body = resBody;
    return next();
}


async function cancelFactoringAppInSF(factoringOpp, sfConn) {
    const invalidFactoringOppStages = ['Funded/Closed Won',
                                        'Not Funded/ Closed lost'];

    if (invalidFactoringOppStages.includes(factoringOpp.StageName)){
        // invalid 403
        return myResponse(false, null, 403, 'Opp stage is invalid.');
    } else {
        // Change the status of the application
        try{
            let result = await sfConn.sobject("Opportunity")
                                .update({
                                    Id: factoringOpp.Id,
                                    StageName: 'Not Funded/ Closed lost',
                                    Lost_Reason__c: 'Canceled by Customer'
                                });
            if (result.success){
                return myResponse(true, {id: result.id}, 200);
            } else {
                return myResponse(false, null, 500, 'Something Wents Wrong. Please Try Again.');
            }
        } catch (e) {
            return myResponse(false, null,500, "An error occured when updating factoring opportunity.", [e]);
        }

        // Change the status of SPOs

        // change the status of offers
    }
}

// exports.submitFactoring = submitFactoring;

module.exports = {
    submitFactoring,
    getCustomerFactoringApplications,
    openFactoringOpp,
    cancelFactoringApp
}