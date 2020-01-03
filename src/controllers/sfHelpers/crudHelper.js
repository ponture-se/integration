const {salesforceException} = require('../customeException');

async function readSobjectInSf(sfConn, sObj, Id) {
    try {
      const result = await sfConn.sobject(sObj)
                                  .retrieve(Id);
      return result;
    } catch (err) {
      console.error('Error in readSobjectInSf (' + sObj + ')', err);

      if (err.errorCode == 'NOT_FOUND'){
        throw new salesforceException('Wrong ' + sObj + ' Id', err);
      } else {
        throw new salesforceException('Something wents wrong, when attemp to get the ' + sObj, err);
      }
    }
}

async function insertSobjectInSf(sfConn, sObj, payload) {
  try {
    const result = await sfConn.sobject(sObj)
                                .insert(payload);
    return result;
  } catch (err) {
    console.error('Error in insertSobjectInSf (' + sObj + ')', err);
    return null;
  }
}


async function updateSobjectInSf(sfConn, sObj, payload, existingId = null) {
  if (!payload.hasOwnProperty('Id') && existingId != null) {
    payload['Id'] = existingId;
  }

  try {
    const result = await sfConn.sobject(sObj)
                                .update(payload);
    return result;
  } catch (err) {
    console.error('Error in updateSobjectInSf (' + sObj + ')', err);
    return null;
  }
}


async function upsertSobjectInSf(sfConn, sObj, payload, existingId = null) {
  let result;
  
  if(existingId != null ) {
    payload['Id'] = existingId;

    result = await updateSobjectInSf(sfConn, sObj, payload, existingId);
  } else {
    result = await insertSobjectInSf(sfConn, sObj, payload);
  }
  
  // result will be 'null' or an object with Id
  return result;
}


module.exports = {
    readSobjectInSf,
    insertSobjectInSf,
    updateSobjectInSf,
    upsertSobjectInSf
}