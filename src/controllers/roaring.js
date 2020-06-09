const axios = require("axios");
const qs = require('qs');
const async = require("async");
const reflectAll = require("async/reflectAll");
const _ = require('lodash');
const { salesforceException } = require('./customeException');

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
    if (method != "get") config.data = data;

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

  async function getRoaringToken() {
    var username = process.env.ROARING_USERNAME;
    var password = process.env.ROARING_PASSWORD;
    var apiRoot = process.env.ROARING_LOGIN_API_ROOT || "https://api.roaring.io";
    var data = username + ":" + password;
    var buff = new Buffer.from(data);
    var base64data = buff.toString("base64");
    var config = {
      url: "/token",
      baseURL: apiRoot,
      method: "post",
      data: qs.stringify({
        grant_type: "client_credentials"
      }),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + base64data
      }
    };
    // console.log(config);
    try{
        const response = await axios(config);
        return {
            success: true,
            data: response.data.access_token
        };
        // req.access_token = response.data.access_token;
        // req.roaring_access_token = response.data.access_token;
        // next();
    } catch (error) {
        return {
            success: false,
            data: error
       }; 
    }
}


function getRoaringData(token, orgNumber, orgName, personalNumber, afterTasksCompleted) {
  var tasks = {
    overview: function (callback) {
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
    ecoOverview: function (callback) {
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
    boardMembers: function (callback) {
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
    beneficialOwners: function (callback) {
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
    signatory: function (callback) {
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
    cmpSanctionInfo: function (callback) {
      callRoaring(
        callback,
        "/global/sanctions-lists/1.0/search",
        "get", {
          name: orgName
        },
        "COMPANY_SANCTION_INVALID_RESPONSE",
        "COMPANY_SANCTION_API_ERROR",
        token
      );
    },
    // perSanctionInfo: function (callback) {
    //   callRoaring(
    //     callback,
    //     "/global/sanctions-lists/1.0/search",
    //     "get", {
    //       name: req.body.bankid.userInfo.name
    //     },
    //     "PERSON_SACNTION_INVALID_RESPONSE",
    //     "PERSON_SACNTION_API_ERROR",
    //     token
    //   );
    // },
    pepInfo: function (callback) {
      callRoaring(
        callback,
        "/nordic/pep/1.0/search",
        "get", {
          personalNumber: personalNumber,
          countryCode: "se"
        },
        "PEP_INVALID_RESPONSE",
        "PEP_API_ERROR",
        token
      );
    }
  };


  async.parallel(async.reflectAll(tasks), afterTasksCompleted);
  
}

async function getPersonalInfo(roaringToken, personalNumber) {
	let apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";

    let config = {
      url: 'person/1.0/person',
      baseURL: apiRoot,
      method: 'Get',
      headers: {
        Authorization: "Bearer " + roaringToken
      },
      params: {
			personalNumber: personalNumber
		}
	};
	
	let result = await axios(config);
	
	return result;
}


  module.exports = {
      callRoaring,
      getRoaringToken,
	  getRoaringData,
	  getPersonalInfo
  }