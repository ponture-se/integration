const jsforce = require('jsforce');
const dotenv = require('dotenv');
dotenv.config();


const conn = new jsforce.Connection({loginUrl : process.env.LOGIN_API_ROOT,
                                    clientId : process.env.SALESFORCE_CLIENTID,
                                  clientSecret: process.env.SALESFORCE_CLIENT_SECRET});

function connect(req, res, next){
    conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD, function (err, userInfo){
      if (err) { 
        res.status(500).send("Error occured when logging in salesforce.");
      } else {
        req.sfConnect = true;
        req.userInfo = userInfo;
        req.sfConn = conn;

        next();
      }
    });
}

module.exports = connect;