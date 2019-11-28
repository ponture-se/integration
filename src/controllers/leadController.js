// const { validate } = require('../models/leadModel');
const util = require('util');
const myToolkit = require('../controllers/myToolkit');
const response = require('../controllers/myResponse');
const accountCrtl = require('./accountController');


async function createLead(req, res, next){
    // const { error } = validate(req.body); 
    // if (error) res.status(400).send(error.details[0].message);
    let resBody = {};

    let customerLeadRecordTypeId = await myToolkit.getRecordTypeId(req.sfConn, 'Lead', 'Customer Lead');

    if (customerLeadRecordTypeId == null || customerLeadRecordTypeId == ''){
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        return res.status(500).send(resBody);
    }

    
    accountCrtl.getAccountFromExternalService(req.body.orgNumber, req.body.companyName, (errors, results) => {
        if (errors && errors.length > 0) {
            resBody = response(false, null, 500, 'Error When Getting Company Info From External Service.', errors);
            return res.status(500).send(resBody);
        }
        else {
            var accountInfo = {};
            for (var attr in results) accountInfo[attr] = results[attr].value;
            insertLeadInSF(req, res, customerLeadRecordTypeId, accountInfo);
        }
        
    });
}

function insertLeadInSF(req, res, customerLeadRecordTypeId, accountInfo) {
    let payload = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        Company: req.body.companyName,
        Organization_Number__c: req.body.orgNumber,
        Phone: req.body.phone,
        Email: req.body.email,
        Description : req.body.description,
        recordTypeId: customerLeadRecordTypeId,
        Problem__c: req.body.interest.join(';'),
        UTM_Source__c: "Objektvision",
        UTM_Medium__c: req.body.utm_medium,
        UTM_Campaign__c: req.body.utm_campaign,
        Referral_ID__c: req.body.referral_id,
        Last_Referral_Date__c: req.body.last_referral_date,
        LeadSource: "Partner Rreferral",
        Lead_Action__c: "Intresseanmälan",
        Status: "New",
        Need_Payoff__c: "Business Loan",
        Marketing_Email_Opt_Out__c: false,
        Sales_Email_Opt_Out__c: false,
        Last_Marketing_Consent_Date__c: Date.now(),
        Last_Sales_Consent_Date__c: Date.now(),
        AnnualRevenue: ((accountInfo.ecoOverview) ? parseFloat(accountInfo.ecoOverview.netTurnover) : null),
        Operating_Profit__c: ((accountInfo.ecoOverview) ?parseFloat(accountInfo.ecoOverview.plOperatingProfit): null),
        Registration_Date__c: ((accountInfo.overview) ? Date.parse(accountInfo.overview.companyRegistrationDate): null),
        Status__c: ((accountInfo.overview) ? accountInfo.overview.statusTextHigh: null),
        Status_Date__c: ((accountInfo.overview) ? Date.parse(accountInfo.overview.statusDateFrom): null),
        NumberOfEmployees: ((accountInfo.overview) ? parseInt(accountInfo.overview.numberEmployees): null),
        Legal_form__c: ((accountInfo.overview) ? accountCrtl.getLegalFormApiName(accountInfo.overview.legalGroupText): null),
        Industry_Code__c: ((accountInfo.overview) ? accountInfo.overview.industryCode : null)

    };

    req.sfConn.sobject("Lead").create(payload, 
        function(err, ret) {
        if (err || !ret.success) {
            if (err.errorCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST'){
                resBody = response(false, null, 400, 'One or more Picklist Values are incorrect.', [err]);
                return res.status(400).send(resBody);
            } else {
                resBody = response(false, null, 500, 'Error Occured When Creating Lead.', [err]);
                return res.status(500).send(resBody);
            }
        } else {
            let resBody = response(true, {id: ret.id}, 200, 'Lead Created.');
            return res.status(200).send(resBody);
        }
    
    });
}


function getLead(req, res, next){
    if (!req.params.id){
        resBody = response(false, null, 400, 'ID Parameter Is Not Set.');
        return res.status(400).send(resBody);
    }
    else {
        req.sfConn.sobject("Lead").retrieve(req.params.id, 
            function(err, lead) {
                if (err) {
                    resBody = response(false, null, 500, null, [err]);
                    return res.status(500).send(resBody);
                }else {
                    resBody = response(true, lead, 200);
                    return res.status(200).send(resBody);
                }
            }
        );
    }
    //next();
}



exports.createLead = createLead;
exports.getLead = getLead;