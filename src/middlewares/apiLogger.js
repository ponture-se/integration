const winston = require("winston");


function logger(req, res, next){
    let reqLog = {
        url: req.originalUrl,
        method: req.method,
        headers: req.headers,
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

    try{
        winston.log(logLevel, 
            reqLog.url,
            {metadata: {
                req: reqLog,
                res: resLog
            }}
        );
    } catch (e) {
        console.log("Error Occured when logging using winston. Error:", e );
    }
    
    return next();
}


module.exports = logger;