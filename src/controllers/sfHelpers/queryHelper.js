const myToolkit = require("../myToolkit");

function hasRecordTypeInWhereClause(where){
    if (!where){
        return false;
    } else if (typeof(where) == 'object'){
        return where.hasOwnProperty(recordTypeId);
    } else if (typeof(where) == 'string'){
        return where.indexOf("recordTypeId") != -1;
    }
}


module.exports = {
    hasRecordTypeInWhereClause
}