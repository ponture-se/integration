function fResult(success, data = null, error = null, msg = null){
    let result = {};

    result.success = success;
    result.data = data;
    result.error = error;
    result.msg = msg;

    return result;
}

module.exports = fResult;