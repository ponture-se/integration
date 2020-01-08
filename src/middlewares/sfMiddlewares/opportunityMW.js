const myToolkit = require('../../controllers/myToolkit');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const opportunityController = require('../../controllers/opportunityController');
const {salesforceException} = require('../../controllers/customeException');
const _ = require('lodash');
const async = require('async');
const agentUserController = require('../../controllers/agentUserController');

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

    let acquisitionReq = req.body.acquisition,
        realEstateReq = req.body.real_estate;


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
            Broker_ID__c: req.body.broker_id        
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

    
    let acquisitionPayload = {},
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
            Object_Valuation_Letter__c: acquisitionReq.object_valuation_letter,
            Account_Balance_Sheet__c: acquisitionReq.account_balance_sheet,
            Account_Income_Statement__c: acquisitionReq.account_income_statement,
            Available_Guarantees__c: acquisitionReq.available_guarantees,
            Available_Guarantees_Description__c: acquisitionReq.available_guarantees_description,
            Purchaser_Profile__c: acquisitionReq.purchaser_profile,
            Own_Investment_Amount__c: acquisitionReq.own_investment_amount,
            Own_Investment_Details__c: acquisitionReq.own_investment_details,
            Additional_files__c: (acquisitionReq.additional_files) ? acquisitionReq.additional_files.join(';') : "",
            Business_Plan__c: (acquisitionReq.business_plan) ? acquisitionReq.business_plan.join(';') : "",
            Additional_details__c: acquisitionReq.additional_details,
            Purchase_type__c: acquisitionReq.purchase_type,
            Description: acquisitionReq.description
        };
        
        Object.assign(payload.opp, acquisitionPayload);
    }

    if (realEstateReq && _.size(realEstateReq) != 0) {
        oppRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Real Estate');
        realEstatePayload = {
            recordTypeId: oppRecordTypeId,
            Object_Price__c: realEstateReq.object_price,
            Object_Area__c: realEstateReq.object_area
        };

        Object.assign(payload.opp, realEstatePayload);
    }


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

async function saveAppExtraValidation(req, res, next) {
    const sfConn = req.needs.sfConn;
    let acquisitionReq = req.body.acquisition,
        realEstateReq = req.body.realEstate
        validationError = false,
        resBody = {};
    
    if (acquisitionReq && _.size(acquisitionReq) != 0 && realEstateReq && _.size(realEstateReq) != 0) {
        resBody = myResponse(false, null, 400, "'acquisition' and 'realEstate' keys can not coexist.");
        res.status(400).send(resBody);
        res.body = resBody;

        validationError = true;
    }  else if (req.body.broker_id) {
        try {
            let result = await agentUserController.getAgentContactDetailByAgentId(sfConn, req.body.broker_id);
            if (!result) {
                resBody = myResponse(false, null, 400, "Invalid Agent Id.");
                res.status(400).send(resBody);
                res.body = resBody;

                validationError = true;
            }
        } catch (err) {
            console.log(err);
            if (err instanceof salesforceException) {
                resBody = myResponse(false, null, err.statusCode, err.message, err.metadata);
                res.status(err.statusCode).send(resBody);
                res.body = resBody;
            } else {
                resBody = myResponse(false, null, 500, 'Something Went Wrong');
                res.status(500).send(resBody);
                res.body = resBody;
            }
            validationError = true;
        }        
    }



    if (validationError) {
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    } else {
        return next();
    }
}


async function getCompaniesList(req, res, next) {
    let resBody;
    let roaring_token = req.access_token,
        personalNumber = req.query.personalNumber;

    let tasks = {
        companies: function (callback) {
            opportunityController.getCompaniesOfPersonalNumber(personalNumber, roaring_token, callback)
        },
        user_info: function (callback) {
            opportunityController.getUserInfo(personalNumber,roaring_token, callback);
        }
    }
    
    async.parallel(async.reflectAll(tasks), (errors, results) => {
        if (!results || 
            results && _.size(results) == 0){
                resBody = myResponse(false, null, 500, 'Something wents wrong', errors);
        } else if (results && _.size(results) != 0 && results.companies && _.size(results.companies) !=0) {
                let response = {
                    companies: (results.companies) ? results.companies.value : [],
                    user_info: (results.user_info) ? results.user_info.value : {}
                }
                resBody = myResponse(true, response, 200);
        } else {
                resBody = myResponse(false, null, 500, 'Something wents wrong', errors);
        }

        res.status(resBody.statusCode).send(resBody);
        res.body = resBody;

        next();
    });
}


module.exports = {
    saveApplicationApi,
    saveAppExtraValidation,
    getCompaniesList
}