const winston = require("winston");


function logger(req, res, next){
    winston.log('info', `#Request : ${JSON.stringify(req.body,null,2)}\n#Response : ${JSON.stringify(res.body,null,2)}`);
    // console.log('#req', req);
    // console.log('#res', res);
    return next();
}


module.exports = logger;