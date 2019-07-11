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
      if (response && response.data && response.data.engagements)
      var output = response.data.engagements.filter(function(x){return x.statusCode==100}); 
        res.status(200).send(output)
      })
      .catch(function (error) {
        console.log(error);
        res.send(error);
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