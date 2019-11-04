const axios = require("axios");
const { validationResult, body, check } = require("express-validator/check");
const { sanitizeBody } = require("express-validator/filter");
const async = require("async");
const reflectAll = require("async/reflectAll");

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
      if (error) {
        callback(error, undefined);
      } else {
        callback(
          { error: JSON.stringify(error), code: apicall_error },
          undefined
        );
      }
    });
}

exports.getcompanyinfo = (req, res, next) => {
  // Validate fields
  if (!req.query.orgNumber) {
    return res.status(422).json({
      success: false,
      code: "INVALID_ORGNUMBER",
      errors: ["OrgNumber is required."]
    });
  }
  if (req.query.orgNumber.length < 10) {
    return res.status(422).json({
      success: false,
      code: "INVALID_ORGNUMBER",
      errors: ["OrgNumber is invalid."]
    });
  }

  if (!req.query.orgName) {
    return res.status(422).json({
      success: false,
      code: "INVALID_ORGNAME",
      errors: ["OrgName is required."]
    });
  }
  var token = req.roaring_access_token;
  var tasks = {
    overview: function(callback) {
      callRoaring(
        callback,
        "/se/company/overview/1.1/" + req.query.orgNumber,
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
        "/se/company/economy-overview/1.1/" + req.query.orgNumber,
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
        "/se/company/board-members/1.1/" + req.query.orgNumber,
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
        "/se/beneficialowner/1.0/company/" + req.query.orgNumber,
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
        "/se/company/signatory/1.1/" + req.query.orgNumber,
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
          name: req.query.orgName
        },
        "COMPANY_SANCTION_INVALID_RESPONSE",
        "COMPANY_SANCTION_API_ERROR",
        token
      );
    }
  };
  var roaring;
  async.parallel(async.reflectAll(tasks), function(errors, results) {
    if (errors && errors.length > 0) {
      res.status(400).send(errors);
    } else res.status(200).send(results);
  });
};
