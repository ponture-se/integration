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


module.exports = {
    insertSobjectInSf,
    updateSobjectInSf
}