const axios = require("axios");
const qs = require('qs');

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


  module.exports = {
      callRoaring,
      getRoaringToken
  }