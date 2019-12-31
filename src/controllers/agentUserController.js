const axios = require('axios');
const jwt = require('jsonwebtoken');
const cnf = require("../config");

async function login(sfToken, username, password){
    let body = {
        username : username,
        password : password
    },
    url = "/services/apexrest/agentLogin";

    let config = {
        url: url,
        baseURL: process.env.SALESFORCE_API_ROOT || 'https://sms--local.my.salesforce.com',
        method: "post",
        data: body,
        headers: {
            Authorization: "Bearer " + sfToken
        }
    };

    
    try{
        const response = await axios(config);

        let jwtPayload = {
            referral_id: response.data.data.referral_id
        },
        jwtSecret = cnf.secret,
        jwtOptions = {
            expiresIn: process.env.AUTHENTICATIONTOKEN_EXPIRE_TIME || 120 * 60
        };
        
        let token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
        
        // return jwtToken in response
        response.data.data.access_token = token;

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