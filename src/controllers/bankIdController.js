const axios = require("axios");
const jwt = require("jsonwebtoken");
const cnf = require("../config");
const { check, validationResult } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");

exports.authenticate = [
  // Validate fields
  check("personalNumber")
    .isNumeric()
    .isLength({ min: 12, max: 12 })
    .withMessage("Personal number is invalid")
    .matches(/^(19|20)?[0-9]{2}(0|1)[0-9][0-3][0-9][-]?[0-9]{4}$/)
    .withMessage("Personal number is in invalid format"),
  //Sanitize fields
  sanitizeBody("personalNumber")
    .trim()
    .escape(),
  (req, res, next) => {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      //There are errors. send error result
      return res.status(422).json({
        success: false,
        code: "INVALID_PERSONALNUMBER",
        errors: errors.array()
      });
      return;
    } else {
      var accessToken = process.env.ACCESS_TOKEN;
      if (!accessToken) {
        res.status(500).json({
          success: false,
          code: "INVALID_BANKID_TOKEN",
          errors: [
            {
              location: "Server",
              param: "Access Token",
              value: null,
              msg: "BankID access token not found."
            }
          ]
        });
        return;
      }
      var apiRoot = process.env.API_ROOT;
      if (!apiRoot) {
        if (process.env.NODE_ENV == "production") {
          apiRoot = "https://api.zignsec.com/v2";
        } else apiRoot = "https://test.zignsec.com/v2";
      }

      var pno = req.body.personalNumber;
      var config = {
        url: "/bankidse/Authenticate",
        baseURL: apiRoot,
        method: "post",
        data: { PersonalNumber: pno },
        headers: {
          Authorization: accessToken
        }
      };
      axios(config)
        .then(function(response) {
          if (response && response.data && response.data.orderRef) {
            var token = jwt.sign(
              {
                orderRef: response.data.orderRef
              },
              cnf.secret,
              {
                expiresIn:
                  process.env.AUTHENTICATIONTOKEN_EXPIRE_TIME || 30 * 60 // expires in 30 minutes
              }
            );
            res
              .status(200)
              .send({
                access_token: token,
                autoStartToken: response.data.autoStartToken
              });
          } else {
            res.status(500).json({
              success: false,
              code: "INVALID_BANKID_RESPONSE",
              errors: [
                {
                  location: "Server",
                  param: "BankID",
                  value: response.data,
                  msg: "BankID response is invalid."
                }
              ]
            });
            return;
          }
        })
        .catch(function(error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            res.status(204).send("No response from BankID server");
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
            res.status(500).send(error.message);
          }
          res.status(400).send(error.config);
        });
    }
  }
];
exports.collect = [
  // Validate fields
  (req, res, next) => {
    if (!req.orderRef) {
      return res.status(422).json({
        success: false,
        code: "INVALID_ORDERREF",
        errors: errors.array()
      });
    }
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      res.status(500).json({
        success: false,
        code: "INVALID_BANKID_TOKEN",
        errors: [
          {
            location: "Server",
            param: "Access Token",
            value: null,
            msg: "BankID access token not found."
          }
        ]
      });
      return;
    }
    var apiRoot = process.env.API_ROOT;
    if (!apiRoot) {
      if (process.env.NODE_ENV == "production") {
        apiRoot = "https://api.zignsec.com/v2";
      } else apiRoot = "https://test.zignsec.com/v2";
    }
    var refid = req.orderRef;
    var config = {
      url: "/bankidse/collect",
      baseURL: apiRoot,
      method: "get",
      params: { orderRef: refid },
      headers: {
        Authorization: accessToken
      }
    };
    axios(config)
      .then(function(response) {
        if (response && response.data) res.status(200).send(response.data);
        else {
          res.status(500).json({
            success: false,
            code: "INVALID_BANKID_RESPONSE",
            errors: [
              {
                location: "Server",
                param: "BankID",
                value: null,
                msg: "BankID response is invalid."
              }
            ]
          });
          return;
        }
      })
      .catch(function(error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          res.status(204).send("No response from BankID server");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          res.status(500).send(error.message);
        }
        console.log(error.config);
        res.status(400).send(error.config);
      });
  }
];

exports.sign = [
  // Validate fields
  check("personalNumber")
    .isNumeric()
    .isLength({ min: 12, max: 12 })
    .withMessage("Personal number is invalid")
    .matches(/^(19|20)?[0-9]{2}(0|1)[0-9][0-3][0-9][-]?[0-9]{4}$/)
    .withMessage("Personal number is in invalid format"),
  //Sanitize fields
  sanitizeBody("personalNumber")
    .trim()
    .escape(),
  (req, res, next) => {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      //There are errors. send error result
      return res.status(422).json({
        success: false,
        code: "INVALID_PERSONALNUMBER",
        errors: errors.array()
      });
      return;
    } else {
      var accessToken = process.env.ACCESS_TOKEN;
      if (!accessToken) {
        res.status(500).json({
          success: false,
          code: "INVALID_BANKID_TOKEN",
          errors: [
            {
              location: "Server",
              param: "Access Token",
              value: null,
              msg: "BankID access token not found."
            }
          ]
        });
        return;
      }
      var apiRoot = process.env.API_ROOT;
      if (!apiRoot) {
        if (process.env.NODE_ENV == "production") {
          apiRoot = "https://api.zignsec.com/v2";
        } else apiRoot = "https://test.zignsec.com/v2";
      }

      var pno = req.body.personalNumber;
      var config = {
        url: "/bankidse/Sign",
        baseURL: apiRoot,
        method: "post",
        data: {
          PersonalNumber: pno,
          userVisibleData: req.body.userVisibleData
        },
        headers: {
          Authorization: accessToken
        }
      };
      axios(config)
        .then(function(response) {
          if (response && response.data) {
            var token = jwt.sign(
              { orderRef: response.data.orderRef },
              cnf.secret,
              {
                expiresIn:
                  process.env.AUTHENTICATIONTOKEN_EXPIRE_TIME || 30 * 60 // expires in 30 minutes
              }
            );
            res.status(200).send({ access_token: token });
          } else {
            res.status(500).json({
              success: false,
              code: "INVALID_BANKID_RESPONSE",
              errors: [
                {
                  location: "Server",
                  param: "BankID",
                  value: null,
                  msg: "BankID response is invalid."
                }
              ]
            });
            return;
          }
        })
        .catch(function(error) {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            res.status(error.response.status).send(error.response.data);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
            res.status(204).send("No response from BankID server");
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
            res.status(500).send(error.message);
          }
          console.log(error.config);
          res.status(400).send(error.config);
        });
    }
  }
];

exports.cancel = [
  // Validate fields
  (req, res, next) => {
    if (!req.orderRef) {
      return res.status(422).json({
        success: false,
        code: "INVALID_ORDERREF",
        errors: errors.array()
      });
    }
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      res.status(500).json({
        success: false,
        code: "INVALID_BANKID_TOKEN",
        errors: [
          {
            location: "Server",
            param: "Access Token",
            value: null,
            msg: "BankID access token not found."
          }
        ]
      });
      return;
    }
    var apiRoot = process.env.API_ROOT;
    if (!apiRoot) {
      if (process.env.NODE_ENV == "production") {
        apiRoot = "https://api.zignsec.com/v2";
      } else apiRoot = "https://test.zignsec.com/v2";
    }
    var refid = req.orderRef;
    var config = {
      url: "/bankidse/cancel",
      baseURL: apiRoot,
      method: "post",
      data: { orderRef: refid },
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
        Authorization: accessToken
      }
    };
    axios(config)
      .then(function(response) {
        if (response && response.data) res.status(200).send(response.data);
        else {
          res.status(500).json({
            success: false,
            code: "INVALID_BANKID_RESPONSE",
            errors: [
              {
                location: "Server",
                param: "BankID",
                value: null,
                msg: "BankID response is invalid."
              }
            ]
          });
          return;
        }
      })
      .catch(function(error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          res.status(204).send("No response from BankID server");
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
          res.status(500).send(error.message);
        }
        console.log(error.config);
        res.status(400).send(error.config);
      });
  }
];
