function fResult(success, data = null, error = null, errorCode = null, msg = null){
    let result = {};

    result.success = success;
    result.data = data;
    result.error = error;
    result.msg = msg;
    result.errorCode = errorCode;

    return result;
}

module.exports = fResult;