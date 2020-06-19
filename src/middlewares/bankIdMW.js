const myResponse = require('../controllers/myResponse');
const _ = require('lodash');
const { salesforceException, notFoundException} = require('../controllers/customeException');
const Constants = require('../controllers/Constants');
const apiLogger = require('./apiLogger');
const queryHelper = require('../controllers/sfHelpers/queryHelper');

async function checkOppForBankIdVerification(req, res, next) {
    let resBody;

    let oppId = req.body.oppId;
    let sfConn = req.needs.sfConn;

    let bankIdRequired = true;

    try {
        let opp;
        try {
            let oppList = await queryHelper.getQueryResultWithThrowingException(sfConn, 'Opportunity',
                                                                {id: oppId},
                                                                '*,' +
                                                                'PrimaryContact__r.Personal_Identity_Number__c,' +
                                                                'Account.Legal_Form_code_list__c,' +
                                                                'Account.Turnover__c');
            if (oppList.length > 0) {
                opp = oppList[0];
            } else {
                throw new notFoundException('Opportunity with given oppId not Found', {givenOppId: oppId});
            }
        } catch (err) {
            throw new salesforceException('oppId is Incorrect.', err, 400);
        }

        let stage = _.get(opp, 'StageName');
        let primaryContactVerified = _.get(opp, 'PrimaryContactVerified__c');
        let amount = _.get(opp, 'Amount');
        let needs = _.get(opp, 'Need__c', '').toLowerCase().split(';');
        let legalForms = _.get(opp, 'Account.Legal_Form_code_list__c', '').toLowerCase().split(';');
        let turnOver = _.get(opp, 'Account.Turnover__c');

        if (primaryContactVerified == true) {
            bankIdRequired = false;
            resBody = myResponse(false, null, 403, 'Primary Contact of this opp was already verified.', null, "ALREADY_VERIFIED");
        } else if (Constants.INVALID_OPP_STAGE_FOR_BANKID_CHECKING.includes(stage.toLowerCase())) {
            bankIdRequired = false;
            resBody = myResponse(false, null, 403, 'Opp stage is invalid and equal to: ' + stage, null, "INVALID_OPP_STAGE");
        } else if (amount > Constants.MIN_AMOUNT_FOR_BANKID_BYPASS) {
            bankIdRequired = false;
            resBody = myResponse(false, null, 403, 'BankId Verification not needed, due to amount value: ' + amount, null, "VERIFICATION_NOT_NEEDED");
        }
        
        if (bankIdRequired && amount > Constants.MIN_AMOUNT_FOR_NON_GENERAL_NEED_TO_BANKID_BYPASS) {
            let allNeedsPassed = true;
            
            for (let need of needs) {
                if (!Constants.NON_GENERAL_LIQUIDITY_NEEDS.includes(need)) {
                    allNeedsPassed = false;
                    break;
                }
            }
            if (allNeedsPassed == true) {
                bankIdRequired = false;
                resBody = myResponse(false, null, 403, "This need and amount doesn't need bankId", null, "NEED_AMOUNT_BYPASS");
            }
        }
        if (bankIdRequired && legalForms != null && legalForms.includes('ab') &&
                    turnOver != null && parseInt(turnOver) > Constants.MIN_TURNOVER_FOR_AB_COMPANY_TO_BANKID_BYPASS &&
                    amount > Constants.MIN_AMOUNT_FOR_AB_COMPANY_TO_BANKID_BYPASS) {
                        bankIdRequired = false;
                        resBody = myResponse(false, null, 403, "The company legal form and other conditions doesn't need bankId", null, "LEGAL_FORM_BYPASS");
        }
        
        if (bankIdRequired){
            req.body.personalNumber = _.get(opp, 'PrimaryContact__r.Personal_Identity_Number__c', 'Invalid Personal Number');
            return next();
        }

    } catch (error) {
        if (error instanceof notFoundException) {
            resBody = myResponse(false, null, error.statusCode || 404, error.message, error);
        } else if (error instanceof salesforceException){
            resBody = myResponse(false, null, error.statusCode || 500, error.message, error);
        } else {
            resBody = myResponse(false, null, 500, 'Something Went Wrong', error);
        }
    }

    res.status(resBody.statusCode).send(resBody);
    res.body = resBody;
    return apiLogger(req, res, () => {return;});			//instead of calling next()
    
    
}

function returnCheckCriteriaResponse (req, res, next) {
    let resBody = myResponse(true, null, 200, 'Criteria was met.');
    res.body = resBody;
    res.status(200).send(resBody);

    return next();
}


module.exports = {
    checkOppForBankIdVerification,
    returnCheckCriteriaResponse
}