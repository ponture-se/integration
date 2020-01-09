const winston = require("winston");


function logger(req, res, next){
    let reqLog = {
        url: req.url,
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

    winston.log(logLevel, 
                    "",
                    {metadata: {
                        req: reqLog,
                        res: resLog
                    }}
                );
    
    return next();
}


module.exports = logger;