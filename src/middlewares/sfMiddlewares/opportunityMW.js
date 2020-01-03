const myToolkit = require('../../controllers/myToolkit');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const opportunityController = require('../../controllers/opportunityController');
const {salesforceException} = require('../../controllers/customeException');

async function saveApplicationApi(req, res, next) {
    let resBody;

    const referral_id = req.jwtData.referral_id;
    const jwtDataLack = myToolkit.checkJwtTokenEssentialData(req.jwtData, 'referral_id');
    if (jwtDataLack.length) {
        resBody = myResponse(false, null, 400, "The token is not provided these data: " + jwtDataLack.join(','));
        res.status(400).send(resBody);
        res.body = resBody;
        return next();
    }

    const sfConn = req.needs.sfConn;
    let today = new Date();             // keeps today's date
    let clostDate = today;
    clostDate.setMonth(clostDate.getMonth() + 1);

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
            Name: `Saved Opp @ ${myToolkit.getFormattedDate()} - ${referral_id}`,
            Referral_ID__c: referral_id        
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

    if (req.body.oppId) {
        payload.opp.Id = req.body.oppId
    };

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