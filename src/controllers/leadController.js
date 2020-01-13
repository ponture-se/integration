// const { validate } = require('../models/leadModel');
const util = require('util');
const myToolkit = require('../controllers/myToolkit');
const response = require('../controllers/myResponse');
const accountCrtl = require('./accountController');


async function createLead(req, res, next){
    // const { error } = validate(req.body); 
    // if (error) res.status(400).send(error.details[0].message);
    let resBody = {};

    let sfConn = req.needs.sfConn;

    let customerLeadRecordTypeId = await myToolkit.getRecordTypeId(sfConn, 'Lead', 'Customer Lead');

    if (customerLeadRecordTypeId == null || customerLeadRecordTypeId == ''){
        resBody = response(false, null, 500, 'sObjName or RecordType was set incorrectly. Please Inform the developer team.');
        // return res.status(500).send(resBody);
        res.status(500).send(resBody);
        res.body = resBody;
        return next();
    }

    let orgNum = req.body.organization_number;

    if (orgNum == null || orgNum == undefined | orgNum == ''){
        insertLeadInSF(req, res, next, customerLeadRecordTypeId, null);
    } else {
        accountCrtl.getAccountFromExternalService(orgNum, req.body.Lead_Company__c, (errors, results) => {
            if (errors && errors.length > 0) {
                resBody = response(false, null, 500, 'Error When Getting Company Info From External Service.', errors);
                // return res.status(500).send(resBody);
                res.status(500).send(resBody);
                res.body = resBody;
                return next();
            }
            else {
                var accountInfo = {};
                for (var attr in results) accountInfo[attr] = results[attr].value;
                insertLeadInSF(req, res, next, customerLeadRecordTypeId, accountInfo);
            }
            
        });
    }
}

function insertLeadInSF(req, res, next, customerLeadRecordTypeId, accountInfo) {
    let roaringPayload = {};
    let sfConn = req.needs.sfConn;

    let payload = {
        recordTypeId: customerLeadRecordTypeId,
        Organization_Number__c: req.body.organization_number,
        Phone: myToolkit.fixPhoneNumber(req.body.phone),
        Email: req.body.email,
        Situation__c: req.body.situation,
        Lead_Revenue__c: req.body.lead_revenue,
        Lead_Company__c: req.body.lead_company,
        lastName: req.body.last_name,
        firstName: req.body.first_name,
        MobilePhone: myToolkit.fixPhoneNumber(req.body.mobile),
        Problem__c: req.body.problem.join(';'),
        Need_Payoff__c: req.body.need_payoff.join(';'),
        Problem_Description__c : req.body.problem_description,
        SPIN_Stage__c: req.body.spin_stage,
        Marketing_Email_Opt_Out__c: req.body.marketing_email_opt_out,
        Sales_Email_Opt_Out__c: req.body.sales_email_opt_out,
        Status: req.body.lead_status || 'New',
        UTM_Source__c: req.body.utm_source,
        UTM_Medium__c: req.body.utm_medium,
        UTM_Campaign__c: req.body.utm_campaign,
        Referral_ID__c: req.body.referral_id,
        Last_Referral_Date__c: req.body.last_referral_date,
        LeadSource: req.body.lead_source,
        Lead_Action__c: req.body.lead_action,
        Specific_Lead_Source__c: req.body.specific_lead_source,
        Last_Marketing_Consent_Date__c: Date.now(),
        Last_Sales_Consent_Date__c: Date.now(),
        Auto_Notification_Enabled__c: true
    };

    if (accountInfo != null) {
        roaringPayload = {
            Company: ((accountInfo.overview) ? accountInfo.overview.companyName: "** Automatic: Cannot get value from external service **"),
            AnnualRevenue: ((accountInfo.ecoOverview) ? parseFloat(accountInfo.ecoOverview.netTurnover) : null),
            Operating_Profit__c: ((accountInfo.ecoOverview) ?parseFloat(accountInfo.ecoOverview.plOperatingProfit): null),
            Registration_Date__c: ((accountInfo.overview) ? Date.parse(accountInfo.overview.companyRegistrationDate): null),
            Status__c: ((accountInfo.overview) ? accountInfo.overview.statusTextHigh: null),
            Status_Date__c: ((accountInfo.overview) ? Date.parse(accountInfo.overview.statusDateFrom): null),
            NumberOfEmployees: ((accountInfo.overview) ? parseInt(accountInfo.overview.numberEmployees): null),
            Legal_form__c: ((accountInfo.overview) ? accountCrtl.getLegalFormApiName(accountInfo.overview.legalGroupText): null),
            Industry_Code__c: ((accountInfo.overview) ? accountInfo.overview.industryCode : null)
        };
    } else {
        roaringPayload = {
            Company: req.body.lead_company,
            AnnualRevenue: req.body.lead_revenue
        };
    }
    

    payload = Object.assign(payload, roaringPayload);

    sfConn.sobject("Lead").create(payload, 
        function(err, ret) {
        if (err || !ret.success) {
            // use this with winston, to save in a file
            // let error = {
            //     "errorCode" : err.errorCode,
            //     "message" : err.message,
            //     "name": err.name
            // };
            if (err.errorCode === 'INVALID_OR_NULL_FOR_RESTRICTED_PICKLIST'){
                resBody = response(false, null, 400, 'One or more Picklist Values are incorrect.', [err]);
                // return res.status(400).send(resBody);
                res.status(400).send(resBody);
                res.body = resBody;
                return next();
            } else {
                resBody = response(false, null, 500, 'Error Occured When Creating Lead.', [err]);
                // return res.status(500).send(resBody);
                res.status(500).send(resBody);
                res.body = resBody;
                return next();
            }
        } else {
            let resBody = response(true, {id: ret.id}, 200, 'Lead Created.');
            // return res.status(200).send(resBody);
            res.status(200).send(resBody);
            res.body = resBody;
            return next();
        }
    
    });
}


function getLead(req, res, next){
    if (!req.params.id){
        resBody = response(false, null, 400, 'ID Parameter Is Not Set.');
        res.status(400).send(resBody);
        res.body = resBody;     // for logging purpose
        return next();
    }
    else {
        let sfConn = req.needs.sfConn;
        
        sfConn.sobject("Lead").retrieve(req.params.id, 
            function(err, lead) {
                if (err) {
                    resBody = response(false, null, 500, null, [err]);
                    res.status(500).send(resBody);
                    res.body = resBody;
                    return next();
                }else {
                    resBody = response(true, lead, 200);
                    res.status(200).send(resBody);
                    res.body = resBody;
                    return next();
                }
            }
        );
    }
}


exports.createLead = createLead;
exports.getLead = getLead;