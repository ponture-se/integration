const axios = require("axios");
const jwt = require("jsonwebtoken");
const cnf = require("../config");
const { check, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const _ = require('lodash');
const myResponse = require('./myResponse');
const Constants = require("./Constants");

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
    let resBody = null;

    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      //There are errors. send error result
      resBody = {
        success: false,
        code: "INVALID_PERSONALNUMBER",
        errors: errors.array()
      };
      res.status(422).json(resBody);
      res.body = resBody;
      return next();
    } else {
      var accessToken = process.env.ACCESS_TOKEN;
      if (!accessToken) {
        resBody = {
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
        };
        res.status(500).json(resBody);
        res.body = resBody;
        return next();
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
            resBody = {
              access_token: token,
              autoStartToken: response.data.autoStartToken
            };
            res
              .status(200)
              .send(resBody);
            res.body = resBody;
          } else {
            resBody = {
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
            };
            res.status(500).json(resBody);
            res.body = resBody;
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
            res.status(500).send(error.message);
            res.body = error.message;
          }
          // res.status(400).send(error.config);
          return next();
        });
    }
  }
];
exports.collect = [
  // Validate fields
  (req, res, next) => {
    let resBody = null;

    if (!req.orderRef) {
      resBody = {
        success: false,
        code: "INVALID_ORDERREF",
        errors: errors.array()
      };
      
      res.status(422).json(resBody);
      res.body = resBody();
      return next();
    }
    
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      resBody = {
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
      };
      res.status(500).json(resBody);
      res.body = resBody;
      return next();
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
        if (response && response.data){
          res.status(200).send(response.data);
          res.body = response.data;
        } else {
          resBody = {
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
          };
          
          res.status(500).json(resBody);
          res.body = resBody;
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
          res.status(500).send(error.message);
          res.body = error.message;
        }
        // console.log(error.config);
        // res.status(400).send(error.config);
        return next();
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
    let resBody = null;

    if (!req.orderRef) {
      resBody = {
        success: false,
        code: "INVALID_ORDERREF",
        errors: errors.array()
      };
      res.status(422).json(resBody);
      res.body = resBody;

      return next();
    }
    var accessToken = process.env.ACCESS_TOKEN;
    if (!accessToken) {
      resBody = {
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
      };
      
      res.status(500).json(resBody);
      res.body = resBody;
      return next();
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
        if (response && response.data) {
          res.status(200).send(response.data);
          res.body = response.data;
        }
        else {
          resBody = {
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
          };
          res.status(500).json(resBody);
          res.body = resBody;
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
          res.status(500).send(error.message);
          res.body = error.message;
        }

        return next();
        // console.log(error.config);
        // res.status(400).send(error.config);
      });
  }
];


exports.checkOppForBankIdVerificationController = function checkOppForBankIdVerificationController(inputObject) {
	let bankIdRequired = true;
	let resBody;

	let stage = _.get(inputObject, 'stage');
	let primaryContactVerified = _.get(inputObject, 'primaryContactVerified');
	let amount = _.get(inputObject, 'amount');
	let needs = _.get(inputObject, 'needs', []);
	let legalForms = _.get(inputObject, 'legalForms', '').toLowerCase();
	let turnOver = _.get(inputObject, 'turnOver');

	if (primaryContactVerified == true) {
		bankIdRequired = false;
		resBody = myResponse(false, null, 403, 'Primary Contact of this opp was already verified.', null, "ALREADY_VERIFIED");
	} else if (Constants.INVALID_OPP_STAGE_FOR_BANKID_CHECKING.includes(stage.toLowerCase())) {
		bankIdRequired = false;
		resBody = myResponse(false, null, 403, 'Opp stage is invalid and equal to: ' + stage, null, "INVALID_OPP_STAGE");
	} else if (amount > Constants.MIN_AMOUNT_FOR_BANKID_BYPASS) {
		bankIdRequired = false;
		resBody = myResponse(false, null, 403, 'BankId Verification not needed, due to amount value: ' + amount, null, "VERIFICATION_NOT_NEEDED");
	}
	
	if (bankIdRequired && amount > Constants.MIN_AMOUNT_FOR_NON_GENERAL_NEED_TO_BANKID_BYPASS) {
		let allNeedsPassed = true;
		
		for (let need of needs) {
			if (!Constants.NON_GENERAL_LIQUIDITY_NEEDS.includes(need)) {
				allNeedsPassed = false;
				break;
			}
		}
		if (allNeedsPassed == true) {
			bankIdRequired = false;
			resBody = myResponse(false, null, 403, "This need and amount doesn't need bankId", null, "NEED_AMOUNT_BYPASS");
		}
	}
	if (bankIdRequired && legalForms != null && legalForms.includes('ab') &&
				turnOver != null && parseInt(turnOver) > Constants.MIN_TURNOVER_FOR_AB_COMPANY_TO_BANKID_BYPASS &&
				amount > Constants.MIN_AMOUNT_FOR_AB_COMPANY_TO_BANKID_BYPASS) {
					bankIdRequired = false;
					resBody = myResponse(false, null, 403, "The company legal form and other conditions doesn't need bankId", null, "LEGAL_FORM_BYPASS");
	}

	if (bankIdRequired) {
		return true;
	} else {
		return resBody;
	}
}