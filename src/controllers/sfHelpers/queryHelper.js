const myToolkit = require("../myToolkit");


async function addRecordType2WhereClause(where, sObj, recordTypeName){
    let result = new Object();
    
    if (hasRecordTypeInWhereClause(where)){
        result.succuss = true;
        result.value = where;
        return result;
    }

    const sfConn = await myToolkit.makeSFConnection();
    if (sfConn == null) {
        result.succuss = false;
        result.value = "Couldn't Connect to Salesforce.";
        return result;
    }

    const rTypeId = await myToolkit.getRecordTypeId(sfConn, sObj, recordTypeName);
    if (rTypeId == null) {
        result.succuss = false;
        result.value = "Wrong RecordTypeId.";
        return result;
    }


    if (!where){
        where.recordTypeId = rTypeId;
    } else if (typeof(where) == 'object'){
        where.recordTypeId = rTypeId;
    } else if (typeof(where) == 'string'){
        where += " AND recordTypeId = '" + rTypeId + "'";
    }

    result.succuss = true;
    result.value = where;
    return result;
}

async function addRecordType2WhereClause(where, rTypeId){
    let result = new Object();

    if (!hasRecordTypeInWhereClause(where)){
        if (!where){
            where.recordTypeId = rTypeId;
        } else if (typeof(where) == 'object'){
            where.recordTypeId = rTypeId;
        } else if (typeof(where) == 'string'){
            where += " AND recordTypeId = '" + rTypeId + "'";
        }
    }

    result.succuss = true;
    result.value = where;
    return result;
}


function hasRecordTypeInWhereClause(where){
    if (!where){
        return false;
    } else if (typeof(where) == 'object'){
        return where.hasOwnProperty(recordTypeId);
    } else if (typeof(where) == 'string'){
        return where.indexOf("recordTypeId") != -1;
    }
}

async function getQueryResult(sfConn, sObj, where, setRecordTypeId = false,  rTypeId = null){
    if (setRecordTypeId && rTypeId != null) {
        let newWhere = addRecordType2WhereClause(where, rTypeId);
        if (newWhere.succuss) {
            where = newWhere.value;
        } else {
            return null;
        }
    }

    try{
        let records = [];
        records = await sfConn.sobject(sObj)
                        .select("*")
                        .where(where)
                        .execute();
        return records;
    
    } catch (e) {
        console.log('## getQueryResult ##', e);
        return null;
    }
}


module.exports = {
    hasRecordTypeInWhereClause,
    addRecordType2WhereClause,
    getQueryResult
}