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

    try {
        let opp;
        try {
            let oppList = await queryHelper.getQueryResultWithThrowingException(sfConn, 'Opportunity',
                                                                {id: oppId},
                                                                '*, PrimaryContact__r.Personal_Identity_Number__c');
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

        if (primaryContactVerified == true) {
            resBody = myResponse(false, null, 403, 'Primary Contact of this opp was already verified.');
        } else if (stage != Constants.OPP_STAGE_OF_OPP_CREATION_WITHOUT_BANK_ID) {
            resBody = myResponse(false, null, 403, 'Opp stage is invalid and equal to: ' + stage);
        } else if (amount > Constants.MIN_AMOUNT_FOR_BANKID_BYPASS) {
            resBody = myResponse(false, null, 403, 'BankId Verification not needed, due to amount value: ' + amount);
        } else {
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


module.exports = {
    checkOppForBankIdVerification
}