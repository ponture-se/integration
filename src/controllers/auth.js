const axios = require('axios');
const qs = require('qs');
const jwt = require('jsonwebtoken');
const cnf = require('../config');
function verifyToken(req, res, next) {
  var token = req.headers['x-access-token'];
  if (token == null || !token)
  {
      token = req.headers['authorization'];
      if (token)
        token = token.replace("Bearer ", "");
  }
  if (!token || token == null)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, cnf.secret, function(err, decoded) {
        if (err)
          return res.status(401).send({ auth: false, message: 'Failed to authenticate token. ' });
        // if everything good, save to request for use in other routes 
        console.log("decoded : ", decoded);
        req.orderRef = decoded.orderRef;
        next();
      });
}

function getRoaringToken(req, res, next) {
    var username = process.env.ROARING_USERNAME || "7WdiQzeZHTNUbReQMt4dwUpAYNoa";
    var password = process.env.ROARING_PASSWORD || "_Mk3choT6cARfmaXdwymWKROpE0a";
    var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";
    var data = username + ":" + password;  
    var buff = new Buffer(data);  
    var base64data = buff.toString('base64');
    var config = {
      url : "/token",
      baseURL : apiRoot,
      method : "post",
      data : qs.stringify({
        "grant_type" : "client_credentials"
      }),
      headers : {
          'Content-Type' : "application/x-www-form-urlencoded",
          "Authorization" : "Basic " + base64data
      }
    };
    console.log(config);
    axios(config).then(function (response) {
      console.log(response.data.access_token)
        req.access_token = response.data.access_token;
        next();
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).send(error);
      });
}

function getSFToken(req, res, next) {
  var client_id = process.env.SALESFORCE_CLIENTID || "3MVG96mGXeuuwTZgBI_DSQZsUSU.NpMlsgog1iSTKORTxBQZC9XD3.NDR5iLSvMzu3IonN7e_wHNJYtRAAR.c";
  var client_secret = process.env.SALESFORCE_CLIENT_SECRET || "DA064B463510A05FCD9284CC90313EC304107EC613292C57CC84A5DAE4734D00";
  var username = process.env.SALESFORCE_USERNAME || "hamed-3eph@force.com.crmdev";
  var password = process.env.SALESFORCE_PASSWORD || "ponZXC123!";
  var apiRoot = process.env.LOGIN_API_ROOT || "https://test.salesforce.com";
  var d = {
      grant_type : 'password',
      client_id : client_id,
      client_secret : client_secret,
      username : username,
      password : password
    };
  
  var config = {
    url : "/services/oauth2/token",
    baseURL : apiRoot,
    method : "post",
    data : qs.stringify(d),
    headers : {
        'Content-Type' : "application/x-www-form-urlencoded"
    }
  };
  console.log(config);
  axios(config).then(function (response) {
      req.access_token = response.data.access_token;
      next();
    })
    .catch(function (error) {
      console.log(error);
      res.status(400).send(error);
    });
}
exports.verifyToken = verifyToken;
exports.getSalesForceToken = getSFToken;
exports.getRoaringToken = getRoaringToken;