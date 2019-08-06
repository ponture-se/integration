const axios = require('axios');

exports.getCompanies = function(req, res, next)
{
  console.log(req.query)
  var token = req.access_token;
    var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io/se";
    var config = {
      url : "/company/engagement/2.0/" + req.query.personalNumber,
      baseURL : apiRoot,
      method : "get",
      headers : {
          'Authorization' : "Bearer " + token
      }
    };
    console.log(config);
    axios(config).then(function (response) {
        if (response && response.data && response.data.engagements && response.data.engagements.length > 0)
        {
          var output = response.data.engagements.filter(function(x){return x.statusCode==100}); 
            res.status(200).send(output);
        }
        else
          res.status(404).send(response.data);
      }
      )
      .catch(function (error) {
        console.log(error);
        res.send(error);
      });
}

exports.submit = function(req, res, next)
{
  var accessToken = req.access_token;
  var apiRoot = process.env.SALESFORCE_API_ROOT || "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url : "/services/apexrest/submit",
    baseURL : apiRoot,
    method : "post",
    data : req.body,
    headers : {
        'Authorization' : "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config).then(function (response) {
    console.log(response.data);
    console.log(response.status);
      res.send(response.data);
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

exports.getNeedsList = function(req, res, next)
{
  var accessToken = req.access_token;
  var apiRoot = process.env.SALESFORCE_API_ROOT || "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url : "needs/services/apexrest/getNeedsFields",
    baseURL : apiRoot,
    method : "get",
    params : req.query
  };
  console.log(config);
  axios(config).then(function (response) {
    console.log(response.data);
    console.log(response.status);
      res.send(response.data);
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