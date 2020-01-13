function response(success, data, statusCode, message = null, errors = []){
    let res = {};
    res.success = success;
    res.message = message;
    res.errors = wrapErrorsInList(errors);
    res.data = data;
    res.statusCode = statusCode;

    return res;
}

function jsonResponse(success, message, errorCode, data, statusCode){
    let res = response(success, message, errorCode, data, statusCode);
    return JSON.stringify(res);
}


function wrapErrorsInList(errors) {
    if (!errors){
        return [];
    } else if (Array.isArray(errors)){
        return errors;
    } else {
        return [errors];
    }
}



module.exports = response;