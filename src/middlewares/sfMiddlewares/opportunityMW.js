const myToolkit = require('../../controllers/myToolkit');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const opportunityController = require('../../controllers/opportunityController');
const {salesforceException} = require('../../controllers/customeException');
const _ = require('lodash');

async function saveApplicationApi(req, res, next) {
    let resBody;

    // const referral_id = req.jwtData.referral_id;
    // const jwtDataLack = myToolkit.checkJwtTokenEssentialData(req.jwtData, 'referral_id');
    // if (jwtDataLack.length) {
    //     resBody = myResponse(false, null, 400, "The token is not provided these data: " + jwtDataLack.join(','));
    //     res.status(400).send(resBody);
    //     res.body = resBody;
    //     return next();
    // }

    const sfConn = req.needs.sfConn;
    let today = new Date();             // keeps today's date
    let clostDate = today;
    clostDate.setMonth(clostDate.getMonth() + 1);

    // Prepare payloads
    let payload = {
        opp: {
            // User Values
            Amount: req.body.amount,
            AmortizationPeriod__c: req.body.amourtizationPeriod,
            Need__c: req.body.need.join(';'),
            NeedDescription__c: req.body.needDescription,
            // Defualt Values
            stageName: 'Created',
            CloseDate: clostDate,
            Name: `Saved Opp @ ${myToolkit.getFormattedDate()} - ${req.body.personalNumber}`,
            Referral_ID__c: req.jwtData.referral_id        
        },
        contact: {
            Email: req.body.email,
            Phone : req.body.phoneNumber,
            Personal_Identity_Number__c: req.body.personalNumber,
            lastName: req.body.lastName,
            firstName: req.body.firstName
        },
        account: {
            Organization_Number__c: req.body.orgNumber,
            Name: req.body.orgName
        }
    }

    let acquisitionReq = req.body.acquisition,
        realEstateReq = req.body.realEstate,
        acquisitionPayload = {},
        realEstatePayload = {},
        oppRecordTypeId;

    if (req.body.oppId) {
        payload.opp.Id = req.body.oppId
    };
    
    if (acquisitionReq && _.size(acquisitionReq) != 0) {
        oppRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Business Acquisition Loan');
        acquisitionPayload = {
            // _objName: req.body.objName,
            // _objCompanyName : req.body.acquisition.objCompanyName,
            // _objOrgNumber : req.body.acquisition.objOrgNumber,
            recordTypeId: oppRecordTypeId,
            Object_Price__c: acquisitionReq.object_price,
            Object_Industry__c: acquisitionReq.object_industry,
            Object_Annual_Report__c: acquisitionReq.object_annual_report,
            Object_Balance_Sheet__c: acquisitionReq.object_balance_sheet,
            Object_Income_Statement__c: acquisitionReq.object_income_statement,
            Object_Valuation_Letter__c: acquisitionReq.object_valuation_letter
        };
        
        Object.assign(payload.opp, acquisitionPayload);
    }

    // if (realEstateReq && _.size(realEstateReq) != 0) {
    //     // recordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Real Estate Financing');
    //     realEstatePayload = {
    //         Name: req.body.realEstate.objName
    //     };
    // }


    try {
        let result = await opportunityController.saveApplication(sfConn, payload);
        console.log('final result', result);

        if (result) {
            resBody = myResponse(true, {id: result}, 200, 'Application has been saved.');
            res.status(200).send(resBody);
            res.body = resBody;
        } else {
            resBody = myResponse(false, null, 500 , 'Unable to save application.');
            res.status(500).send(resBody);
            res.body = resBody;
        }
    
    } catch (err) {
        console.log(err);
        switch (true) {
            case err instanceof salesforceException:
                resBody = myResponse(false, null, err.statusCode, err.message, err.metadata);
                res.status(err.statusCode).send(resBody);
                break;
        
            default:
                resBody = myResponse(false, null, 500, err.message);
                res.status(500).send(resBody);
                break;
        }

        res.body = resBody;
    }

    return next();
            
}


module.exports = {
    saveApplicationApi
}