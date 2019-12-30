const axios = require('axios');

async function login(sfToken, username, password){
    let body = {
        username : username,
        password : password
    },
    url = "/services/apexrest/agentLogin";

    var config = {
        url: url,
        baseURL: process.env.SALESFORCE_API_ROOT || 'https://sms--local.my.salesforce.com',
        method: "post",
        data: body,
        headers: {
            Authorization: "Bearer " + sfToken
        }
    };
    // console.log(config);
    try{
        const response = await axios(config);
        return {
            success: true,
            data: response.data
        };
    } catch (error) {
        return {
            success: false,
            data: error
        }; 
    }
}

module.exports = {
    login
}