const axios = require("axios");
const async = require("async");
const reflectAll = require("async/reflectAll");
const {callRoaring, getRoaringToken} = require('./roaring');

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


exports.getLegalFormApiName = getLegalFormApiName;
exports.getAccountFromExternalService = getAccountFromExternalService;

exports.getcompanyinfo = async (req, res, next) => {
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

  getAccountFromExternalService(req.query.orgNumber, req.query.orgName, (errors, results) => {
    if (errors && errors.length > 0) {
          res.status(400).send(errors);
        } else {
          var value = {};
          for (var attr in results) value[attr] = results[attr].value;
          res.status(200).send(value);
        }
      });
};
