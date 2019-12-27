const _ = require("lodash");

function refineJsonResponseKeys(response){
    let data;

    // Check if input is response object or normal object
    let isResponseObj = (response.data) ? true : false;
    if (isResponseObj){
        data = response.data;
    } else {
        data = response;
    }

    let isArray = Array.isArray(data);
    if (isArray){
        let newData = [];
        data.forEach(item => {
            newData.push(refineSingleObjectResKeys(item));
        });
        
        if (isResponseObj){
            response.data = newData;
            return response;
        } else {
            return newData;
        }

    } else {
        return refineSingleObjectResKeys(data);
    }
}

function refineSingleObjectResKeys(obj){
    if (!Array.isArray(obj) && typeof(data) == 'object'){
        throw new Error('Input is not an Object.');
    } else {
        let newObj = {};
        let newKey;
        _.each(obj, (val, key) => {
            newKey = _.trimEnd(_.snakeCase(key), '__c');
            newObj[newKey] = val;
        });

        return newObj;
    }
}


module.exports = {
    refineJsonResponseKeys
}