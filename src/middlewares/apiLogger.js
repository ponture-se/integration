const winston = require("winston");


function logger(req, res, next){
    let reqLog = {
        url: req.url,
        method: req.method,
        params: req.params,
        query: req.query,
        body: req.body
    }
    , resLog = {
        body: res.body,
        status: res.statusCode
    };

    let logLevel = null;
    if (res.statusCode >= 500) {
        logLevel = 'error';
    } else if (res.statusCode >= 400) {
        logLevel = 'warn';
    } else if (res.statusCode >= 100) {
        logLevel = 'info';
    }

    winston.log(logLevel, 
                    `{` +
                    `"req" : ${JSON.stringify(reqLog, null, 2)}` +
                    `, "res" : ${JSON.stringify(resLog, null, 2)}` +
                    `}`
                );
    
    return next();
}


module.exports = logger;