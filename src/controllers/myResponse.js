function response(success, data, statusCode, message = null, errors = []){
    let res = {};
    res.success = success;
    res.message = message;
    res.errors = errors;
    res.data = data;
    res.statusCode = statusCode;

    return res;
}

function jsonResponse(success, message, errorCode, data, statusCode){
    let res = response(success, message, errorCode, data, statusCode);
    return JSON.stringify(res);
}


module.exports = response;