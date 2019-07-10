const axios = require('axios');

exports.getCompanies = function(req, res, next)
{
    var apiRoot = process.env.APPLY_API_ROOT || "https://crmdev-ponture-crmdev.cs84.force.com";
    var d = {
        pid : req.personalNumber,
        orderRef : req.orderRef
      };
    
    var config = {
      url : "/services/apexrest/roaringRest/getCmpOfPid",
      baseURL : apiRoot,
      method : "get",
      params : d,
      headers : {
          'Authorization' : "Bearer " + req.token
      }
    };
    console.log(config);
    axios(config).then(function (response) {
        res.status(200).send(response.data)
      })
      .catch(function (error) {
        console.log(error);
        res.status(400).send(error);
      });
}

exports.submit = function(req, res, next)
{
  var accessToken = process.env.ACCESS_TOKEN || "1059b83f-72da-47ae-a4f2-5db923545fbd";
  var apiRoot = process.env.API_ROOT || "https://test.zignsec.com/v2"; // for prod set to https://api.zignsec.com/v2
  console.log(req);
  var refid = req.query.orderRef;
  var config = {
    url : "/bankidse/collect",
    baseURL : apiRoot,
    method : "get",
    params : {"orderRef" : refid},
    headers : {
        'Authorization' : accessToken
    }
  };
  axios(config).then(function (response) {
      res.status(200).send(response.data);
    })
    .catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        res.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log(error.request);
        res.status(204).send("No response from BankID server");
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        res.status(500).send(error.message);
      }
      console.log(error.config);
      res.status(400).send(error.config);
    });
}