const axios = require("axios");
const async = require("async");
const reflectAll = require("async/reflectAll");
const {callRoaring, getRoaringToken} = require('./roaring');
const apiLogger = require('../middlewares/apiLogger');
const fResult = require('./functionResult');
const queryHelper = require('./sfHelpers/queryHelper');

async function getAccountFromExternalService(orgNumber, orgName = '*** NOTHING ***', finalCallback){
  const roaringTokenRes = await getRoaringToken();

  if (!roaringTokenRes.success){
    return {
      success: false,
      errors : roaringTokenRes.data
    };
  }

  var token = roaringTokenRes.data;
  var tasks = {
    overview: function(callback) {
      callRoaring(
        callback,
        "/se/company/overview/1.1/" + orgNumber,
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
        "/se/company/economy-overview/1.1/" + orgNumber,
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
        "/se/company/board-members/1.1/" + orgNumber,
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
        "/se/beneficialowner/1.0/company/" + orgNumber,
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
        "/se/company/signatory/1.1/" + orgNumber,
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
          name: orgName
        },
        "COMPANY_SANCTION_INVALID_RESPONSE",
        "COMPANY_SANCTION_API_ERROR",
        token
      );
    }
  };

  async.parallel(async.reflectAll(tasks), finalCallback);
}


function getLegalFormApiName(legalText) {
  const legalTextMap = {
      'privat aktiebolag': 'Private Aktiebolag',
      'handelsbolag' : 'Handelsbolag',
      'enskild firma' : 'Enskildfirma',
      'övriga' : 'Other'
  };

  return (legalTextMap[legalText.toLowerCase()] || null);
}

exports.getcompanyinfo = async (req, res, next) => {
  let resBody = null;
  // Validate fields
  if (!req.query.orgNumber) {
    resBody = {
      success: false,
      code: "INVALID_ORGNUMBER",
      errors: ["OrgNumber is required."]
    };
    res.status(422).json(resBody);
  }
  else if (req.query.orgNumber.length < 10) {
    resBody = {
      success: false,
      code: "INVALID_ORGNUMBER",
      errors: ["OrgNumber is invalid."]
    };
    res.status(422).json(resBody);
  }
  else if (!req.query.orgName) {
    resBody = {
      success: false,
      code: "INVALID_ORGNAME",
      errors: ["OrgName is required."]
    };
    res.status(422).json(resBody);
  }

  // if input errors occured, response returnd and logged.
  if (resBody != null) {
    res.body = resBody;
    return apiLogger(req, res, () => {return;});
  }

  getAccountFromExternalService(req.query.orgNumber, req.query.orgName, (errors, results) => {
    if (errors && errors.length > 0) {
          res.status(400).send(errors);
          res.body = errors;
        } else {
          var value = {};
          for (var attr in results) value[attr] = results[attr].value;
          res.status(200).send(value);
          res.body = value;
        }

        return next();
      });
};

exports.getLegalFormApiName = getLegalFormApiName;
exports.getAccountFromExternalService = getAccountFromExternalService;