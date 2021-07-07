const jsforce = require('jsforce');
const response = require("../controllers/myResponse");
const apiLogger = require("./apiLogger");
const logger = require('../controllers/customeLogger');
const myToolkit = require("../controllers/myToolkit");
const dotenv = require('dotenv');
dotenv.config();


async function getSFConnection(req, res, next){
  let resBody;
  let conn;

  let isAccessTokenLogin = (req.jwtData && req.jwtData.stoken);

  try{
    if (isAccessTokenLogin) {
      let access_token = myToolkit.decrypt(req.jwtData.stoken);
      let sf_instance_url = process.env.SALESFORCE_API_ROOT;

      conn = new jsforce.Connection({instanceUrl : sf_instance_url,
        accessToken : access_token
      });

    } else {
      conn = new jsforce.Connection({loginUrl : process.env.LOGIN_API_ROOT,
                                          clientId : process.env.SALESFORCE_CLIENTID,
                                        clientSecret: process.env.SALESFORCE_CLIENT_SECRET});
      
      await conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD);
    
    }
      
    myToolkit.addPairToReqNeeds(req, 'sfConn', conn);
    return next();
  
  } catch (err) {
    console.log(err);

    resBody = response(false, null, 500, 'Error occured when logging in salesforce.');
    res.status(500).send(resBody);
    res.body = resBody;			// For logging purpose
    
    return apiLogger(req,res, () => {return;});     //instead of calling next()
  }

}

module.exports = getSFConnection;