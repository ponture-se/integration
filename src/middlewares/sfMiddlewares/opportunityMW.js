const myToolkit = require('../../controllers/myToolkit');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const opportunityController = require('../../controllers/opportunityController');
const {salesforceException, inputValidationException} = require('../../controllers/customeException');
const _ = require('lodash');
const async = require('async');
const agentUserController = require('../../controllers/agentUserController');
const queryHelper = require('../../controllers/sfHelpers/queryHelper');
const crudHelper = require('../../controllers/sfHelpers/crudHelper');
const auth = require('../../controllers/auth');

const logger = require('../../controllers/customeLogger');

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
    
    let toBeAttachedFiledIds = [];


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

    
    let acquisitionPayload = {},
        realEstatePayload = {},
        oppRecordTypeId;

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
                
                return next();
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
        if(acquisitionReq.additional_files.length) toBeAttachedFiledIds = toBeAttachedFiledIds.concat(acquisitionReq.additional_files);
        if(acquisitionReq.business_plan.length) toBeAttachedFiledIds = toBeAttachedFiledIds.concat(acquisitionReq.business_plan);

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
            let result = await agentUserController.getAgentContactDetailByAgentId(sfConn, req.body.broker_id);
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
            // console.log(savedOppData);
            logger.info('savedOppData', {metadata: savedOppData});
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
                req.body.need = req.body.need || savedOppData.Need__c.split(';');
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
                }
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

module.exports = {
    saveApplicationApi,
    saveAppExtraValidation,
    getCompaniesList,
    authMwDecision,
    fillRequestOfSavedOpp
}