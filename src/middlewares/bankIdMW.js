const myResponse = require('../controllers/myResponse');
const _ = require('lodash');
const { salesforceException, notFoundException} = require('../controllers/customeException');
const Constants = require('../controllers/Constants');
const apiLogger = require('./apiLogger');
const queryHelper = require('../controllers/sfHelpers/queryHelper');
const bankIdController = require('../controllers/bankIdController');

async function checkOppForBankIdVerification(req, res, next) {
    let resBody;

    let oppId = req.body.oppId;
    let sfConn = req.needs.sfConn;

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


        let inputObj = {
            stage: _.get(opp, 'StageName'),
            primaryContactVerified: _.get(opp, 'PrimaryContactVerified__c'),
            amount: _.get(opp, 'Amount'),
            needs: _.get(opp, 'Need__c', '').toLowerCase().split(';'),
            legalForms: _.get(opp, 'Account.Legal_Form_code_list__c', '').split(';'),
            turnOver: _.get(opp, 'Account.Turnover__c')
        }

        let result = bankIdController.checkOppForBankIdVerificationController(inputObj);
        
        if (result == true){
            req.body.personalNumber = _.get(opp, 'PrimaryContact__r.Personal_Identity_Number__c', 'Invalid Personal Number');
            return next();
        } else {
            resBody = result;
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