const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const cnf = require("../config");
const roaring = require('./roaring');
const apiLogger = require('../middlewares/apiLogger');


function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"];
  let resBody = null;
  if (token == null || !token) {
    token = req.headers["authorization"];
    if (token) token = token.replace("Bearer ", "");
  }
  if (!token || token == null){
    resBody = { auth: false, message: "No token provided." };
    res.status(403).send(resBody);
    res.body = resBody;
    
    return apiLogger(req, res, () => {return;});
  }
  jwt.verify(token, cnf.secret, function(err, decoded) {
    if (err){
      resBody = { auth: false, message: "Failed to authenticate token. " };
      res.status(401).send(resBody);
      res.body = resBody;

      return apiLogger(req, res, () => {return;});
    }
    // if everything good, save to request for use in other routes
    console.log("decoded : ", decoded);
    req.orderRef = decoded.orderRef;
    req.jwtData = decoded;
    next();
  });
}

function noAuthNeeded(req, res, next) {
  var token = req.headers["x-access-token"];
  if (token == null || !token) {
    token = req.headers["authorization"];
    if (token) token = token.replace("Bearer ", "");
  }
  if (token) {
    let resBody = { auth: false, message: "No authentication needed." };
    res.status(400).send(resBody);
    res.body = resBody;

    return apiLogger(req, res, () => {return;});
  }
  next();
}

async function getRoaringToken(req, res, next) {
  // var username = process.env.ROARING_USERNAME;
  // var password = process.env.ROARING_PASSWORD;
  // var apiRoot = process.env.ROARING_LOGIN_API_ROOT || "https://api.roaring.io";
  // var data = username + ":" + password;
  // var buff = new Buffer(data);
  // var base64data = buff.toString("base64");
  // var config = {
  //   url: "/token",
  //   baseURL: apiRoot,
  //   method: "post",
  //   data: qs.stringify({
  //     grant_type: "client_credentials"
  //   }),
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //     Authorization: "Basic " + base64data
  //   }
  // };
  // console.log(config);
  // axios(config)
  //   .then(function(response) {
  //     req.access_token = response.data.access_token;
  //     req.roaring_access_token = response.data.access_token;
  //     next();
  //   })
  //   .catch(function(error) {
  //     res.status(400).send(error);
  //   });
  const response =  await roaring.getRoaringToken();

  if (response.success){
    req.access_token = response.data;
    req.roaring_access_token = response.data;
    next();
  } else {
    res.status(400).send(response.data);
    res.body = response.data;
    
    return apiLogger(req, res, () => {return;});
  }

}

function getSFToken(req, res, next) {
  var client_id = process.env.SALESFORCE_CLIENTID;
  var client_secret = process.env.SALESFORCE_CLIENT_SECRET;
  var username = process.env.SALESFORCE_USERNAME;
  var password = process.env.SALESFORCE_PASSWORD;
  var apiRoot = process.env.LOGIN_API_ROOT || "https://test.salesforce.com";
  var d = {
    grant_type: "password",
    client_id: client_id,
    client_secret: client_secret,
    username: username,
    password: password
  };

  var config = {
    url: "/services/oauth2/token",
    baseURL: apiRoot,
    method: "post",
    data: qs.stringify(d),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      req.access_token = response.data.access_token;
      req.sf_access_token = response.data.access_token;
      next();
    })
    .catch(function(error) {
      res.status(400).send(error);
      res.body = error;
      return apiLogger(req,res, () => {return;});
    });
}

var login = function(req, res, next) {
  let resBody = null;
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/customerLogin",
    baseURL: apiRoot,
    method: "post",
    data: req.body,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      if (response.data.success) {
        console.log(response.data);
        var token = jwt.sign(
          {
            // access_token: req.access_token,
            personalNumber: response.data.data.personalNumber
          },
          cnf.secret,
          {
            expiresIn: process.env.AUTHENTICATIONTOKEN_EXPIRE_TIME || 120 * 60 // expires in 30 minutes
          }
        );

        resBody = { access_token: token, userInfo: response.data.data };
        res
          .status(200)
          .send(resBody);

        res.body = resBody;
      } else {
        res.status(response.statusCode).send(response);
        res.body = response;
      }
      return next();
    })
    .catch(function(error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        res.status(error.response.status).send(error.response.data);
        res.body = error.response.data;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        let msg = "No response from BankID server";
        res.status(204).send(msg);
        res.body = msg;
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log("Error", error.message);
        resBody = { error: "Error in loading needs list from salesforce" };
        res
          .status(500)
          .send(resBody);
        
        res.body = resBody;
      }
      // res
      //   .status(400)
      //   .send({ error: "Error in loading needs list from salesforce" });

      return next();
    });
    
};


exports.noAuthNeeded = noAuthNeeded;
exports.verifyToken = verifyToken;
exports.getSalesForceToken = getSFToken;
exports.getRoaringToken = getRoaringToken;
exports.login = login;
