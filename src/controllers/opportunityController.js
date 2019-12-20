const axios = require("axios");
const { validationResult, body, check } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const async = require("async");
const reflectAll = require("async/reflectAll");

exports.getCompanies = [
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
      var token = req.access_token;
      var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";
      var config = {
        url: "/se/company/engagement/2.0/" + req.query.personalNumber,
        baseURL: apiRoot,
        method: "get",
        headers: {
          Authorization: "Bearer " + token
        }
      };
      console.log(config);
      axios(config)
        .then(function(response) {
          if (
            response &&
            response.data &&
            response.data.engagements &&
            response.data.engagements.length > 0
          ) {
            var output = response.data.engagements.filter(function(x) {
              return x.statusCode == 100;
            });
            res.status(200).send(output);
          } else res.status(200).send([]);
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
            res.status(204).send("No response from Roaring server");
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
            res.status(500).send({ error: "Error in loading companioes" });
          }
          res
            .status(400)
            .send({ error: "Error in loading companioes from roaring" });
        });
    }
  }
];

function callRoaring(
  callback,
  url,
  method,
  data,
  invalid_response_error,
  apicall_error,
  token
) {
  var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";
  var config = {
    url: url,
    baseURL: apiRoot,
    method: method,
    headers: {
      Authorization: "Bearer " + token
    },
    params: data
  };
  if (method == "get") config.query;
  else config.data = data;
  //console.log(config);
  axios(config)
    .then(function(response) {
      if (response && response.data) {
        var output = response.data;
        callback(undefined, output);
      } else callback({ error: error, code: invalid_response_error }, undefined);
    })
    .catch(function(error) {
      callback(
        { error: JSON.stringify(error), code: apicall_error },
        undefined
      );
    });
}

exports.submit = [
  // Validate fields
  body("personalNumber", "Personal number is required")
    .not()
    .isEmpty()
    .withMessage("Personalnumber is required")
    .isNumeric()
    .isLength({ min: 12, max: 12 })
    .withMessage("Personal number is invalid")
    .matches(/^(19|20)?[0-9]{2}(0|1)[0-9][0-3][0-9][-]?[0-9]{4}$/)
    .withMessage("Personal number is in invalid format"),
  body("orgNumber", "Organization number is required")
    .isNumeric()
    .not()
    .isEmpty()
    .isLength({ min: 9, max: 10 })
    .withMessage("Organization number is invalid"),
  body("orgName", "Organization name is required")
    .isString()
    .isLength({ min: 1 })
    .withMessage("Invalid organization name"),
  body("amount", "amount is required")
    .not()
    .isEmpty()
    .isNumeric()
    .isDecimal()
    .withMessage("Invalid amount"),
  body("amourtizationPeriod", "amourtizationPeriod is required")
    .not()
    .isEmpty()
    .isNumeric()
    .isInt()
    .withMessage("Invalid amourtizationPeriod"),
  body("phoneNumber", "PhoneNumber is required")
    .not()
    .isEmpty()
    .isString()
    .isLength({ min: 9 })
    .withMessage("Invalid phone number"),
  body("bankid", "BankID detail is required")
    .not()
    .isEmpty()
    .withMessage("BankID detail is required"),
  body("bankid.userInfo", "BankID userInfo is required")
    .not()
    .isEmpty()
    .withMessage("BankID userInfo is required"),
  body("bankid.ocspResponse", "BankID ocspResponse is required")
    .not()
    .isEmpty()
    .withMessage("BankID ocspResponse is required"),
  //Sanitize fields
  sanitizeBody("personalNumber")
    .trim()
    .escape(),
  sanitizeBody("orgNumber")
    .trim()
    .escape(),
  sanitizeBody("phoneNumber")
    .trim()
    .escape(),
  sanitizeBody("orgName")
    .trim()
    .escape(),
  (req, res, next) => {
    console.log(req.url);
    console.log(JSON.stringify(req.body));
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
      //There are errors. send error result
      return res.status(422).json({
        success: false,
        code: "INVALID_REQUEST",
        errors: errors.array()
      });
      return;
    } else {
      var token = req.roaring_access_token;
      var tasks = {
        overview: function(callback) {
          callRoaring(
            callback,
            "/se/company/overview/1.1/" + req.body.orgNumber,
            "get",
            undefined,
            "COMPANY_OVERVIEW_INVALID_RESPONSE",
            "COMPANY_OVERVIEW_API_ERROR",
            token
          );
        },
        ecoOverview: function(callback) {
          callRoaring(
            callback,
            "/se/company/economy-overview/1.1/" + req.body.orgNumber,
            "get",
            undefined,
            "COMPANY_ECOOVERVIEW_INVALID_RESPONSE",
            "COMPANY_ECOOVERVIEW_API_ERROR",
            token
          );
        },
        boardMembers: function(callback) {
          callRoaring(
            callback,
            "/se/company/board-members/1.1/" + req.body.orgNumber,
            "get",
            undefined,
            "COMPANY_BOARDMEMBERS_INVALID_RESPONSE",
            "COMPANY_BOARDMEMBERS_API_ERROR",
            token
          );
        },
        beneficialOwners: function(callback) {
          callRoaring(
            callback,
            "/se/beneficialowner/1.0/company/" + req.body.orgNumber,
            "get",
            undefined,
            "COMPANY_BENEFICIAL_INVALID_RESPONSE",
            "COMPANY_BENEFICIAL_API_ERROR",
            token
          );
        },
        signatory: function(callback) {
          callRoaring(
            callback,
            "/se/company/signatory/1.1/" + req.body.orgNumber,
            "get",
            undefined,
            "COMPANY_SIGNATORY_INVALID_RESPONSE",
            "COMPANY_SIGNATORY_API_ERROR",
            token
          );
        },
        cmpSanctionInfo: function(callback) {
          callRoaring(
            callback,
            "/global/sanctions-lists/1.0/search",
            "get",
            {
              name: req.body.orgName
            },
            "COMPANY_SANCTION_INVALID_RESPONSE",
            "COMPANY_SANCTION_API_ERROR",
            token
          );
        },
        perSanctionInfo: function(callback) {
          callRoaring(
            callback,
            "/global/sanctions-lists/1.0/search",
            "get",
            {
              name: req.body.bankid.userInfo.name
            },
            "PERSON_SACNTION_INVALID_RESPONSE",
            "PERSON_SACNTION_API_ERROR",
            token
          );
        },
        pepInfo: function(callback) {
          callRoaring(
            callback,
            "/nordic/pep/1.0/search",
            "get",
            {
              personalNumber: req.body.personalNumber,
              countryCode: "se"
            },
            "PEP_INVALID_RESPONSE",
            "PEP_API_ERROR",
            token
          );
        }
      };
      var roaring;
      async.parallel(async.reflectAll(tasks), function(errors, results) {
        console.log(JSON.stringify(results));
        if (!results || (results && results.length == 0)) {
          console.log(
            "No response from roaring api. Results array is empty. Errors : " +
              JSON.stringify(errors)
          );
          return Promise.reject(errors);
        } else {
          for (var attr in results) req.body[attr] = results[attr].value;
          token = req.sf_access_token;
          var apiRoot =
            process.env.SALESFORCE_API_ROOT || "https://cs85.salesforce.com"; // for prod set to https://api.zignsec.com/v2
          var config = {
            url: "/services/apexrest/submitWithoutCallout",
            baseURL: apiRoot,
            method: "post",
            data: req.body,
            headers: {
              Authorization: "Bearer " + token
            }
          };
          console.log("Sending submit to salesforce : " + config);
          axios(config)
            .then(function(response) {
              console.log(JSON.stringify(response.data));
              res.send(response.data);
            })
            .catch(function(error) {
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
              }
              console.log(error.config);
              console.log(error.toJSON());
              if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                return Promise.reject(error.response);
              } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                return Promise.reject("No response from BankID server");
              } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
                return Promise.reject(error.message);
              }
              return Promise.reject(error.response);
            });
        }
      });
    }
  }
];

exports.getNeedsList = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/getNeedsFields",
    baseURL: apiRoot,
    method: "get",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};

exports.myrequests = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/getCustomerApp",
    baseURL: apiRoot,
    method: "get",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};

exports.acceptOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/acceptOffer",
    baseURL: apiRoot,
    method: "put",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};

exports.getOffers = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/offersPerOpp",
    baseURL: apiRoot,
    method: "get",
    params: req.params,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};
exports.rejectOffer = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/rejectOffer",
    baseURL: apiRoot,
    method: "put",
    params: req.query,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};

exports.cancel = function(req, res, next) {
  var accessToken = req.access_token;
  var apiRoot =
    process.env.SALESFORCE_API_ROOT ||
    "https://crmdev-ponture-crmdev.cs84.force.com"; // for prod set to https://api.zignsec.com/v2
  var config = {
    url: "/services/apexrest/cancelApplication",
    baseURL: apiRoot,
    method: "put",
    params: req.params,
    headers: {
      Authorization: "Bearer " + accessToken
    }
  };
  console.log(config);
  axios(config)
    .then(function(response) {
      res.send(response.data);
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
        res
          .status(500)
          .send({ error: "Error in loading needs list from salesforce" });
      }
      res
        .status(400)
        .send({ error: "Error in loading needs list from salesforce" });
    });
};
