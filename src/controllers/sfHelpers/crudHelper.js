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


module.exports = {
    insertSobjectInSf,
}