const crudHelper = require('./sfHelpers/crudHelper');
const myToolkit = require('./myToolkit');
const { inputValidationException, salesforceException } = require('./customeException');

async function insertContactEvidences(sfConn, contactId, bankId) {
    // input validation
    if (!contactId || typeof contactId != 'string'){
        throw new inputValidationException('Invalid contactId');
    } else if (!bankId || typeof bankId != 'object') {
        throw new inputValidationException('Invalid bankId');
    }

    // Prepare Payload
    const payload = {
        Name: 'Evidence of ' + bankId.userInfo.personalNumber + ' @ ' + myToolkit.getFormattedDate(),
        Contact__c: contactId,
        signature__c: bankId.signature,
        ocspResponse__c: bankId.ocspResponse
    }

    let result;
    try {
        result = await crudHelper.insertSobjectInSf(sfConn, 'Contact_Evidences__c', payload);
    } catch (err) {
        throw new salesforceException('Something Went Wrong', err, 500);
    }

    if (!result) {
        throw new salesforceException('Can not Insert the Contact_Evidences__c', null, 500);
    } else {
        console.log(result);
        return result;
    }
}


module.exports = {
    insertContactEvidences
}