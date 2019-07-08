const axios = require('axios');

exports.start = function(req, res, next)
{
    var accessToken = process.env.ACCESS_TOKEN || "1059b83f-72da-47ae-a4f2-5db923545fbd";
    var apiRoot = process.env.API_ROOT || "https://test.zignsec.com/v2"; // for prod set to https://api.zignsec.com/v2

    var pno = req.body.personalNumber;
    var config = {
      url : "/bankidse/Authenticate",
      baseURL : apiRoot,
      method : "post",
      data : {"PersonalNumber" : pno},
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

exports.collect = function(req, res, next)
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

exports.sign = function(req, res, next)
{

}

exports.cancel = function(req, res, next)
{
  var accessToken = process.env.ACCESS_TOKEN || "1059b83f-72da-47ae-a4f2-5db923545fbd";
  var apiRoot = process.env.API_ROOT || "https://test.zignsec.com/v2"; // for prod set to https://api.zignsec.com/v2
  console.log(req);
  var refid = req.body.orderRef;
  var config = {
    url : "/bankidse/cancel",
    baseURL : apiRoot,
    method : "post",
    data : {"orderRef" : refid},
    headers : {
        'Content-Type': 'application/json; charset=UTF-8',
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