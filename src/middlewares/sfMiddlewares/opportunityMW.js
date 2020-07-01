const myToolkit = require('../../controllers/myToolkit');
const axios = require("axios");
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const opportunityController = require('../../controllers/opportunityController');
const {salesforceException, inputValidationException, notFoundException} = require('../../controllers/customeException');
const _ = require('lodash');
const async = require('async');
const userController = require('../../controllers/userController');
const queryHelper = require('../../controllers/sfHelpers/queryHelper');
const crudHelper = require('../../controllers/sfHelpers/crudHelper');
const auth = require('../../controllers/auth');
const roaring = require('../../controllers/roaring');

const app = require('../../app');

const logger = require('../../controllers/customeLogger');
const Constants = require('../../controllers/Constants');

async function saveApplicationApi(req, res, next) {
    let resBody;
    const sfConn = req.needs.sfConn;

    let payload = req.needs.payload;
    let toBeAttachedFiledIds = req.needs.toBeAttachedFiledIds;

    try {
        let result = await opportunityController.saveApplication(sfConn, payload, toBeAttachedFiledIds);

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
        
        if (err instanceof salesforceException){
            resBody = myResponse(false, null, err.statusCode, err.message, err.metadata);
            res.status(err.statusCode).send(resBody);
        } else if (err instanceof inputValidationException) {
            resBody = myResponse(false, null, err.statusCode, err.message, err.metadata);
            res.status(err.statusCode).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, err.message);
            res.status(500).send(resBody);
        }

        res.body = resBody;
    }

    return next();
}

async function prepareSavePayload(req, res, next) {
    const sfConn = req.needs.sfConn;

    let today = new Date();             // keeps today's date
    let clostDate = today;
    let acquisitionReq = req.body.acquisition,
        realEstateReq = req.body.real_estate;
    let toBeAttachedFiledIds = [];
    let acquisitionPayload = {},
        realEstatePayload = {},
        oppRecordTypeId;

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
            UTM_Source__c: req.body.utm_source,
            UTM_Medium__c: req.body.utm_medium,
            UTM_Campaign__c: req.body.utm_campaign,
            Referral_ID__c: req.body.referral_id,
            Last_referral_date__c: req.body.last_referral_date,
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
        },
        
        bankid: req.body.bankid
    }

    // set opp.Id if oppId exists in req.body
    if (req.body.oppId) {
        payload.opp.Id = req.body.oppId
    };
    
    if (acquisitionReq && _.size(acquisitionReq) != 0) {
        oppRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Business Acquisition Loan');
        // upsert Acquisition Object Account (If not exist: Generic, else: recordType not changed)
        if (acquisitionReq.object_organization_number) {
            // Try to get Acc
            // Get Account with orgNumber
			let getAccWhereCluase = {
				Organization_Number__c: acquisitionReq.object_organization_number
			}
			account = await queryHelper.getSingleQueryResult(sfConn, 'Account', getAccWhereCluase);
            accId = (account != null) ? account.Id : null;

            if (!accId) {
                let genericAccRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Account', 'Generic');

                let acqObjectInfo = {
                    Organization_Number__c: acquisitionReq.object_organization_number,
                    Name: acquisitionReq.object_company_name || acquisitionReq.object_organization_number,
                    recordTypeId: genericAccRecordTypeId
                }
                let acquisitionObjectData = await crudHelper.upsertSobjectInSf(sfConn, 'Account', acqObjectInfo, accId);
                accId = (acquisitionObjectData != null) ? acquisitionObjectData.id : null;
            }

            if (accId) {
                payload.opp.Acquisition_Object__c = accId;
            } else {
                resBody = myResponse(false, null, 500 , 'Something wents wrong. \'object_company_name\' or \'object_organization_number\' have some problems. Please recheck.');
                res.status(500).send(resBody);
                res.body = resBody;
                
                // return next();
                return apiLogger(req, res, () => {return;});			//instead of calling next()
            }

        }

        acquisitionPayload = {
            // _objCompanyName : req.body.acquisition.objCompanyName,
            // _objOrgNumber : req.body.acquisition.objOrgNumber,
            recordTypeId: oppRecordTypeId,
            Object_Name__c: acquisitionReq.object_name,
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

        if(acquisitionReq.object_valuation_letter) toBeAttachedFiledIds.push(acquisitionReq.object_valuation_letter);
        if(acquisitionReq.object_annual_report) toBeAttachedFiledIds.push(acquisitionReq.object_annual_report);
        if(acquisitionReq.object_balance_sheet) toBeAttachedFiledIds.push(acquisitionReq.object_balance_sheet);
        if(acquisitionReq.object_income_statement) toBeAttachedFiledIds.push(acquisitionReq.object_income_statement);
        if(acquisitionReq.account_balance_sheet) toBeAttachedFiledIds.push(acquisitionReq.account_balance_sheet);
        if(acquisitionReq.account_income_statement) toBeAttachedFiledIds.push(acquisitionReq.account_income_statement);
        if(acquisitionReq.additional_files && acquisitionReq.additional_files.length) toBeAttachedFiledIds = toBeAttachedFiledIds.concat(acquisitionReq.additional_files);
        if(acquisitionReq.business_plan && acquisitionReq.business_plan.length) toBeAttachedFiledIds = toBeAttachedFiledIds.concat(acquisitionReq.business_plan);

    }

    if (realEstateReq && _.size(realEstateReq) != 0) {
        oppRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Opportunity', 'Real Estate');
        realEstatePayload = {
            recordTypeId: oppRecordTypeId,
            real_estate_type__c : realEstateReq.real_estate_type,
            real_estate_usage_category__c : realEstateReq.real_estate_usage_category.join(','),
            real_estate_price__c : realEstateReq.real_estate_price,
            real_estate_taxation_value__c : realEstateReq.real_estate_taxation_value,
            real_estate_size__c : realEstateReq.real_estate_size,
            real_estate_address__c : realEstateReq.real_estate_address,
            real_estate_city__c : realEstateReq.real_estate_city,
            real_estate_link__c : realEstateReq.real_estate_link,
            real_estate_description__c : realEstateReq.real_estate_description,
            real_estate_document__c : realEstateReq.real_estate_document,
            Description: realEstateReq.description,
            Additional_details__c: realEstateReq.additional_details,
            Own_Investment_Amount__c: realEstateReq.own_investment_amount,
        };

        Object.assign(payload.opp, realEstatePayload);
        
        if (realEstateReq.real_estate_document) toBeAttachedFiledIds.push(realEstateReq.real_estate_document);
    }

    req.needs.payload = payload;
    req.needs.toBeAttachedFiledIds = toBeAttachedFiledIds;

    return next();
}

async function saveAppExtraValidation(req, res, next) {
    const sfConn = req.needs.sfConn;
    let acquisitionReq = req.body.acquisition,
        realEstateReq = req.body.real_estate,
        validationError = false,
        resBody = {};
    
    if (acquisitionReq && _.size(acquisitionReq) != 0 && realEstateReq && _.size(realEstateReq) != 0) {
        resBody = myResponse(false, null, 400, "'acquisition' and 'real_estate' keys can not coexist.");
        res.status(400).send(resBody);
        res.body = resBody;

        validationError = true;
    } else if (req.body.bankid && req.body.bankid.userInfo && req.body.bankid.userInfo.personalNumber 
        && req.body.personalNumber != req.body.bankid.userInfo.personalNumber) {
        resBody = myResponse(false, null, 400, "The given personalNumber is not match with the bankId personalNumber");
        res.status(400).send(resBody);
        res.body = resBody;

        validationError = true;

    } else if (req.body.broker_id) {
        try {
            let result = await userController.getAgentContactDetailByAgentId(sfConn, req.body.broker_id);
            if (!result) {
                resBody = myResponse(false, null, 400, "Invalid Broker ID.");
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


function authMwDecision(req,res, next) {
    if (req.body.broker_id != null && req.body.broker_id.trim() != '') {
        auth.noAuthNeeded(req, res, next);
    } else {
        auth.verifyToken(req, res, next);
    }
}


async function fillRequestOfSavedOpp(req, res, next) {
    const sfConn = req.needs.sfConn;
    const oppId = req.body.oppId;
    let resBody;
    let hasResponse = false;
    let recordTypeName;

    if (oppId != null && oppId.trim() != '') {
        try{
            let savedOppData = await opportunityController.getSavedOppRequiredDataById(sfConn, oppId);
            
            try {
                recordTypeName = await myToolkit.getRecordTypeName(sfConn, 'opportunity', savedOppData.RecordTypeId);
            } catch (e) {
                logger.error('getRecordTypeName func => fillRequestOfSavedOpp', e);
                recordTypeName = null;
            }

            if (savedOppData == null) {
                resBody = myResponse(false, null, 400, 'oppId is invalid');
                res.status(400).send(resBody);
                
                hasResponse = true;
            } else if (savedOppData != null && savedOppData.StageName != 'Created') {
                resBody = myResponse(false, null, 403, 'Stage of the Saved Opportunity is invalid, it equals to \'' + savedOppData.StageName + '\'');
                res.status(403).send(resBody);
                
                hasResponse = true;
            } else if (savedOppData != null && savedOppData.PrimaryContactVerified__c != true) {
                resBody = myResponse(false, null, 403, 'The contact of this saved opportunity is not verified yet.');
                res.status(403).send(resBody);

                hasResponse = true;
            } else {
                req.body.orgNumber = req.body.orgNumber || (savedOppData.Account) ? savedOppData.Account.Organization_Number__c : null;
                req.body.orgName = req.body.orgName || (savedOppData.Account) ? savedOppData.Account.Name : null;
                req.body.personalNumber = req.body.personalNumber || (savedOppData.PrimaryContact__r) ? savedOppData.PrimaryContact__r.Personal_Identity_Number__c : null;
                req.body.amount = req.body.amount || savedOppData.Amount;
                req.body.amourtizationPeriod = req.body.amourtizationPeriod || savedOppData.AmortizationPeriod__c;
                req.body.email = req.body.email || (savedOppData.PrimaryContact__r) ? savedOppData.PrimaryContact__r.Email : null;
                req.body.phoneNumber = req.body.phoneNumber || (savedOppData.PrimaryContact__r) ? savedOppData.PrimaryContact__r.Phone || savedOppData.PrimaryContact__r.MobilePhone : null;
                req.body.need = req.body.need || (savedOppData.Need__c) ? savedOppData.Need__c.split(';') : null;
                req.body.needDescription = req.body.needDescription || savedOppData.NeedDescription__c;
                req.body.referral_id = req.body.referral_id || savedOppData.Referral_ID__c;
                req.body.utm_source = req.body.utm_source || savedOppData.UTM_Source__c;
                req.body.utm_medium = req.body.utm_medium || savedOppData.UTM_Medium__c;
                req.body.utm_campaign = req.body.utm_campaign || savedOppData.UTM_Campaign__c;
                req.body.ad_gd = req.body.ad_gd || savedOppData.Last_referral_date__c;
                req.body.bankid = {
                    userInfo : {
                        name : (savedOppData.PrimaryContact__r) ? savedOppData.PrimaryContact__r.Name : null
                    }
                }

                if (recordTypeName && recordTypeName == 'Business Acquisition Loan'){
                    // acqusition data
                    req.body.acquisition = {
                        object_name : savedOppData.Object_Name__c,
                        object_organization_number: (savedOppData.Acquisition_Object__r) ? savedOppData.Acquisition_Object__r.Organization_Number__c : null,
                        object_company_name : (savedOppData.Acquisition_Object__r) ? savedOppData.Acquisition_Object__r.Name : null,
                        object_price: savedOppData.Object_Price__c,
                        object_industry: savedOppData.Object_Industry__c,
                        object_annual_report: savedOppData.Object_Annual_Report__c,
                        object_balance_sheet: savedOppData.Object_Balance_Sheet__c,
                        object_income_statement: savedOppData.Object_Income_Statement__c,
                        object_valuation_letter: savedOppData.Object_Valuation_Letter__c,
                        account_balance_sheet: savedOppData.Account_Balance_Sheet__c,
                        account_income_statement: savedOppData.Account_Income_Statement__c,
                        available_guarantees: savedOppData.Available_Guarantees__c,
                        available_guarantees_description: savedOppData.Available_Guarantees_Description__c,
                        purchaser_profile: savedOppData.Purchaser_Profile__c,
                        own_investment_amount: savedOppData.Own_Investment_Amount__c,
                        own_investment_details: savedOppData.Own_Investment_Details__c,
                        additional_files: (savedOppData.Additional_files__c != null) ? savedOppData.Additional_files__c.split(';') : null,
                        business_plan: (savedOppData.Business_Plan__c != null) ? savedOppData.Business_Plan__c.split(';') : null,
                        additional_details: savedOppData.Additional_details__c,
                        purchase_type: savedOppData.Purchase_type__c,
                        description: savedOppData.Description
                    }

                    req.body.acquisition = _.omitBy(req.body.acquisition, _.isNull);
                } else if (recordTypeName && recordTypeName == 'Real Estate') {
                    // real_estate data
                    req.body.real_estate = {
                        real_estate_type : savedOppData.Real_Estate_Type__c,
                        real_estate_usage_category : (savedOppData.Real_Estate_Usage_Category__c) ? savedOppData.Real_Estate_Usage_Category__c.split(',') : null,
                        real_estate_price : savedOppData.Real_Estate_Price__c,
                        real_estate_taxation_value : savedOppData.Real_Estate_Taxation_Value__c,
                        real_estate_size : savedOppData.Real_Estate_Size__c,
                        real_estate_address : savedOppData.Real_Estate_Address__c,
                        real_estate_city : savedOppData.Real_Estate_City__c,
                        real_estate_link : savedOppData.Real_Estate_Link__c,
                        real_estate_description : savedOppData.Real_Estate_Description__c,
                        real_estate_document : savedOppData.Real_Estate_Document__c,
                        own_investment_amount : savedOppData.Own_Investment_Amount__c,
                        description : savedOppData.Description,
                        additional_details : savedOppData.Additional_details__c
                    }

                    req.body.real_estate = _.omitBy(req.body.real_estate, _.isNull);
                }

                req.body = _.omitBy(req.body, _.isNull);
            }

        } catch (e) {
            logger.error('fillRequestOfSavedOpp Error', {metadata: e});

            resBody = myResponse(false, null, 500, 'Something Went Wrong', e);
            res.status(500).send(resBody);
            
            hasResponse = true;
        }        
    }

    if (hasResponse) {
        res.body = resBody;
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    } else {
        return next();
    }
}

async function saveAppBeforeSubmit(req, res, next) {
    let sfConn = req.needs.sfConn;
    let realEstateReq = req.body.real_estate,
        acquisitionReq = req.body.acquisition;

    let payload,
        toBeAttachedFiledIds;
    let result;
    
    let isRealEstate = (realEstateReq && _.size(realEstateReq) != 0);
    let isAcquisition = (acquisitionReq && _.size(acquisitionReq) != 0);
    let isCustomer = (!req.body.broker_id || (req.body.broker_id && req.body.broker_id.trim() == ''));
    let hasOppId = (req.body.oppId && req.body.oppId.trim != '');
    
    // Check if app is a real-estate & the user is customer (Not Agent)
    if (isAcquisition
        || (isAcquisition && isRealEstate)
        || ((isRealEstate || isAcquisition) && hasOppId)
        || ((isRealEstate || isAcquisition) && !isCustomer)) {
            resBody = myResponse(false, null, 400, 'Bad requset. Please check your req body.');
            res.status(400).send(resBody);
            res.body = resBody;
            
            return apiLogger(req, res, () => {return;});			//instead of calling next()

    } else if (isRealEstate && isCustomer) {
        try {
            await prepareSavePayload(req,res, () => {return;});
            payload = req.needs.payload;
            toBeAttachedFiledIds = req.needs.toBeAttachedFiledIds;
        } catch (error) {
            logger.error('saveAppBeforeSubmit - on prepareSavePayload Block', {metadata: error});

            resBody = myResponse(false, null, 500 , 'Preparing Save Payload encountered a problem.');
            res.status(500).send(resBody);
            res.body = resBody;
            
            return apiLogger(req, res, () => {return;});			//instead of calling next()
        }

        try {
            result = await opportunityController.saveApplication(sfConn, payload, toBeAttachedFiledIds);

            if (result) {
                req.body.oppId = result;
                return next();
            } else {
                resBody = myResponse(false, null, 500 , 'Something Wents wrong. Application could not be saved before submitting.');
                res.status(500).send(resBody);
                res.body = resBody;
                
                return apiLogger(req, res, () => {return;});			//instead of calling next()
            }
        } catch (error) {
            logger.error('saveAppBeforeSubmit - on saveApplication Block', {metadata: error});
        
            if (error instanceof salesforceException){
                resBody = myResponse(false, null, error.statusCode, error.message, error.metadata);
                res.status(error.statusCode).send(resBody);
            } else if (error instanceof inputValidationException) {
                resBody = myResponse(false, null, error.statusCode, error.message, error.metadata);
                res.status(error.statusCode).send(resBody);
            } else {
                resBody = myResponse(false, null, 500, error.message);
                res.status(500).send(resBody);
            }
    
            res.body = resBody;

            return apiLogger(req, res, () => {return;});			//instead of calling next()
        }
    } else {
        return next();
    }
}


async function offersOfLatestOppApi(req, res, next) {
    let sfConn = req.needs.sfConn,
        personalNum = req.query.personalNum;
    let resBody;

    try {
        resBody = await opportunityController.offersOfLatestOppController(sfConn, personalNum);
        res.status(200).send(resBody);
        res.body = resBody;
    } catch (e) {
        resBody = myResponse(false, null, e.statusCode || 500, e.message, e);
        res.status(resBody.statusCode).send(resBody);
        res.body = resBody;
    }

    return next();
}

async function offersOfLatestOppV2Api(req, res, next) {
    let sfConn = req.needs.sfConn,
        personalNum = req.query.personalNum,
        orgNumber = req.query.orgNumber;
    let resBody;

    try {
        resBody = await opportunityController.offersOfLatestOppV2Controller(sfConn, personalNum, orgNumber);
        res.status(200).send(resBody);
        res.body = resBody;
    } catch (e) {
        resBody = myResponse(false, null, e.statusCode || 500, e.message, e);
        res.status(resBody.statusCode).send(resBody);
        res.body = resBody;
    }

    return next();
}

async function createOpportunityMw(req, res, next) {
    let sfConn = req.needs.sfConn;
    let roaingToken = req.roaring_access_token;
    let resBody;

    let isBankIdRequired = _.get(req, 'needs.bankIdRequired', true);

    try {
        let today = new Date();             // keeps today's date
        let clostDate = today;
        clostDate.setMonth(clostDate.getMonth() + 1);

        let payload = {
            opp: {
                Amount: req.body.amount,
                AmortizationPeriod__c: req.body.amourtizationPeriod,
                Need__c: req.body.need.join(';'),
                NeedDescription__c: req.body.needDescription,
                stageName: (isBankIdRequired) 
                            ? Constants.OPP_STAGE_OF_OPP_CREATION_WITH_BANK_ID_NEEDED
                            : Constants.OPP_STAGE_OF_OPP_CREATION_WITH_NO_BANK_ID_NEEDED,
                Key_Deal__c: (isBankIdRequired) 
                            ? false
                            : true,
                CloseDate: clostDate,
                Given_Revenue__c: req.body.givenRevenue,
                Product_Code__c: req.body.pcode,
                UTM_Source__c: req.body.utm_source,
                UTM_Medium__c: req.body.utm_medium,
                UTM_Campaign__c: req.body.utm_campaign,
                Referral_ID__c: req.body.referral_id,
                Last_referral_date__c: req.body.last_referral_date,
                Name: `Saved Opp @ ${myToolkit.getFormattedDate()} - ${req.body.personalNumber}`,
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


        let result = await opportunityController.createOpportunityController(sfConn, payload);
        if (result) {
            let resData = {
                oppId: result,
                bankIdRequired: isBankIdRequired
            }

            req.body.oppId = resData.oppId;
            req.body.bankIdRequired = resData.bankIdRequired;

            resBody = myResponse(true, resData, 200);
            res.body = resBody;
            res.status(200).send(resBody);
        }
        else {
            resBody = myResponse(false, null, 500, 'Something went wrong');
            res.body = resBody;
            res.status(500).send(resBody);
        }
    } catch (error) {
        resBody = myResponse(false, null, 500, error.message || 'Something went wrong', error);
        res.body = resBody;
        res.status(500).send(resBody);
    }
    
    return next();
}


async function checkIfBankIdVerificationNeeded(req, res, next) {
    let roaringToken = req.roaring_access_token;
    
	let orgNumber = req.body.orgNumber,
        amount = req.body.amount,
        needs = req.body.need,
        legalForm = _.get(req, 'body.overview.legalGroupCode', ''),
        turnOver = _.get(req, 'body.ecoOverview.netTurnover', '');

    // 1st Condition Checking
    if (amount > Constants.MIN_AMOUNT_FOR_BANKID_BYPASS) {
        myToolkit.addPairToReqNeeds(req, 'bankIdRequired', false);
        return next();
    }


    // 3rd Condition Checking
    if (amount > Constants.MIN_AMOUNT_FOR_NON_GENERAL_NEED_TO_BANKID_BYPASS) {
        let allNeedsPassed = true;
        
        for (let need of needs) {
            if (!Constants.NON_GENERAL_LIQUIDITY_NEEDS.includes(need)) {
                allNeedsPassed = false;
                break;
            }
        }

        if (allNeedsPassed == true) {
            myToolkit.addPairToReqNeeds(req, 'bankIdRequired', false);
            return next();
        }
    }

    
    // 2nd Condition Checking
    if (legalForm != null && legalForm.toLowerCase() == 'ab' &&
        turnOver != null && parseInt(turnOver) > Constants.MIN_TURNOVER_FOR_AB_COMPANY_TO_BANKID_BYPASS &&
        amount > Constants.MIN_AMOUNT_FOR_AB_COMPANY_TO_BANKID_BYPASS) {
            myToolkit.addPairToReqNeeds(req, 'bankIdRequired', false);
            return next();
        } else {
            myToolkit.addPairToReqNeeds(req, 'bankIdRequired', true);
            return next();
        }
}

async function fillReqWithRoaringData(req, res, next) {
    let resBody;

    let roaingToken = req.roaring_access_token;

    let orgNumber = req.body.orgNumber,
        orgName = req.body.orgName,
        personalNum = req.body.personalNumber,
        personName = _.get(req, 'body.bankid.userInfo.name') || _.get(req, 'body.firstName' + '') + ' ' + _.get(req, 'body.lastName' + '');
    

    roaring.getRoaringData(roaingToken, orgNumber, orgName, personalNum, personName, (errors, results) => {
        let roaringData = {};

        if (!results ||
            !_.has(results, 'overview.value') ||
            !_.has(results, 'ecoOverview.value')) {

            resBody = myResponse(false, null, 500, 'Roaring data has some problem', errors);
            res.status(500).send(resBody);

        } else {
            for (var attr in results) roaringData[attr] = results[attr].value;
            
            req.body = _.assign({}, req.body, roaringData);

            return next();
        }
    });
}

async function getPersonRoaringDataMW(req, res, next) {
    let roaringToken = req.roaring_access_token;
    let personalNum = req.body.personalNumber;
    
    try {
        let roaringPersonInfo = await roaring.getPersonalInfo(roaringToken, personalNum);
        let mainPersonalInfo = _.get(roaringPersonInfo, ['data', 'posts', '0', 'details', '0'], {});
        req.body.lastName =  _.get(mainPersonalInfo, 'surName', 'Contact ' + personalNum),
        req.body.firstName =  _.get(mainPersonalInfo, 'firstName', '')
    } catch (error) {
        logger.error('Roaring Personal Info Error', {metadata: {
            error: error
        }});
        
        req.body.lastName = 'Contact ' + personalNum;
        req.body.firstName = '';
    }

    return next();
}


async function fillSubmitReqBodyFromExistingOppMw(req, res, next) {
    const sfConn = req.needs.sfConn;
    const oppId = req.body.oppId;
    let resBody;

    try{
        let existingOpp = await opportunityController.getSavedOppRequiredDataById_enhanced(sfConn, oppId);

        // if (existingOpp.StageName.toLowerCase() != Constants.OPP_STAGE_OF_OPP_CREATION_WITH_NO_BANK_ID_NEEDED) {
        //     resBody = myResponse(false, null, 403, 'Stage of the Existing Opportunity is invalid, it equals to \'' + existingOpp.StageName + '\'');
        //     res.status(403).send(resBody);

        //     res.body = resBody;
        //     return apiLogger(req, res, () => {return;});			//instead of calling next()
        // }

        req.body.orgNumber = req.body.orgNumber || (existingOpp.Account) ? existingOpp.Account.Organization_Number__c : null;
        req.body.orgName = req.body.orgName || (existingOpp.Account) ? existingOpp.Account.Name : null;
        req.body.personalNumber = req.body.personalNumber || (existingOpp.PrimaryContact__r) ? existingOpp.PrimaryContact__r.Personal_Identity_Number__c : null;
        req.body.amount = req.body.amount || existingOpp.Amount;
        req.body.amourtizationPeriod = req.body.amourtizationPeriod || existingOpp.AmortizationPeriod__c;
        req.body.email = req.body.email || (existingOpp.PrimaryContact__r) ? existingOpp.PrimaryContact__r.Email : null;
        req.body.phoneNumber = req.body.phoneNumber || (existingOpp.PrimaryContact__r) ? existingOpp.PrimaryContact__r.Phone || existingOpp.PrimaryContact__r.MobilePhone : null;
        req.body.need = req.body.need || (existingOpp.Need__c) ? existingOpp.Need__c.split(';') : null;
        req.body.needDescription = req.body.needDescription || existingOpp.NeedDescription__c;
        req.body.givenRevenue = req.body.givenRevenue || existingOpp.Given_Revenue__c || null;
        req.body.Product_Code__c = req.body.Product_Code__c || existingOpp.Product_Code__c || null;
        req.body.referral_id = req.body.referral_id || existingOpp.Referral_ID__c;
        req.body.utm_source = req.body.utm_source || existingOpp.UTM_Source__c;
        req.body.utm_medium = req.body.utm_medium || existingOpp.UTM_Medium__c;
        req.body.utm_campaign = req.body.utm_campaign || existingOpp.UTM_Campaign__c;
        req.body.ad_gd = req.body.ad_gd || existingOpp.Last_referral_date__c;
        // req.body.bankid = req.body.bankid;

        req.body = _.omitBy(req.body, _.isNull);
        // }

        return next();

    } catch (e) {
        if (e instanceof notFoundException) {
            resBody = myResponse(false, null, e.statusCode, e.message, e);
            res.status(e.statusCode || 404).send(resBody);
        } else if (e instanceof salesforceException){
            resBody = myResponse(false, null, e.statusCode, e.message, e);
            res.status(e.statusCode || 500).send(resBody);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong', e);
            res.status(500).send(resBody);
        }

        res.body = resBody;
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    }        
}



function submit_v2(req, res, next) {
	let token = req.sf_access_token;
	var apiRoot =
		process.env.SALESFORCE_API_ROOT || "https://cs85.salesforce.com"; // for prod set to https://api.zignsec.com/v2
	var config = {
		url: "/services/apexrest/submit/v2",
		baseURL: apiRoot,
		method: "post",
		data: req.body,
		headers: {
			Authorization: "Bearer " + token
		}
	};
	console.log("Sending submit to salesforce : " + config);
	
	axios(config)
		.then(function (response) {
            console.log(JSON.stringify(response.data));
			res.status(200).send(response.data);
			res.body = response.data;
			return next();
		})
		.catch(function (error) {
			if (error.response) {
				// The request was made and the server responded with a status code
				// that falls out of the range of 2xx
				console.log(error.response.data);
				console.log(error.response.status);
				console.log(error.response.headers);

				res.status(error.response.status).send(error.response.data);
				res.body = error.response.data;
			} else if (error.request) {
				// The request was made but no response was received
				// `error.request` is an instance of XMLHttpRequest in the browser and an instance of
				// http.ClientRequest in node.js
				console.log(error.request);
				let msg = "No response from BankID server";
				res.status(500).send(msg);
				res.body = msg; // For logging purpose
			} else {
				// Something happened in setting up the request that triggered an Error
				console.log("Error", error.message);
				res.status(500).send(error.message);
				res.body = error.message; // For logging purpose
			}
			console.log(error.config);
			console.log(error.toJSON());
			// return Promise.reject(error.response);
			return next();
		});
}


async function updateAccountAndQualify(req, res, next) {
    let sfConn = req.needs.sfConn;

    try {
        let result = await sfConn.apex.post("/updateCreatedApp", req.body);

        logger.info("updateAccountAndQualify Success", {
            metadata: {
                req: {
                    body: req.body,
                    headers: req.headers,
                    params: req.params,
                    query: req.query
                },
                res: {
                    body: res.body,
                    headers: req.headers,
                },
                sfResult: result
            }
        } )

    } catch (e) {
        logger.error("updateAccountAndQualify Error", {
            metadata: {
                req: {
                    body: req.body,
                    headers: req.headers,
                    params: req.params,
                    query: req.query
                },
                res: {
                    body: res.body,
                    headers: req.headers,
                },
                error: e
            }
        })
    }

    return next();
}


module.exports = {
    saveApplicationApi,
    saveAppExtraValidation,
    getCompaniesList,
    authMwDecision,
    fillRequestOfSavedOpp,
    saveAppBeforeSubmit,
    prepareSavePayload,
    offersOfLatestOppApi,
    offersOfLatestOppV2Api,
    createOpportunityMw,
    checkIfBankIdVerificationNeeded,
    fillReqWithRoaringData,
    fillSubmitReqBodyFromExistingOppMw,
    submit_v2,
    getPersonRoaringDataMW,
    updateAccountAndQualify
}