const axios = require('axios');
const jwt = require('jsonwebtoken');
const cnf = require("../config");
const myToolkit = require('./myToolkit');
const queryHelper = require('./sfHelpers/queryHelper');
const myResponse = require('./myResponse');
const { salesforceException } = require('./customeException');

async function login(sfToken, username, password, loginRole){
    if (loginRole == 'admin') {
        let jwtPayload = {
            admin_id: username,
            role: 'admin',
            stoken: myToolkit.encryptData(sfToken)
        },
        jwtSecret = cnf.secret,
        jwtOptions = {
            expiresIn: process.env.AUTHENTICATIONTOKEN_EXPIRE_TIME || 120 * 60
        };
        
        let token = jwt.sign(jwtPayload, jwtSecret, jwtOptions);

        let resBody = myResponse(true, {
            admin_id: username,
            role: 'admin',
            access_token: token
        },
        200, 'User exist.');

        return {
            success: true,
            data: resBody
        }
    
    } else {
        let body = {
            username : username,
            password : password
        },
        url = "/services/apexrest/userLogin";
    
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
                broker_id: response.data.data.broker_id,
                admin_id: response.data.data.admin_id,
                role: response.data.data.role,
                // stoken: myToolkit.encryptData(sfToken)
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
}


async function getAgentContactDetailByAgentId(sfConn, agentId) {
    let whereCluase = {
        Broker_ID__c: agentId
    }
    try{
        let result = await queryHelper.getQueryResult(sfConn, 'Contact', whereCluase);

        if (result && result.length > 0) {
            if (result.length == 1){
                return result[0];
            } else {
                throw new salesforceException('More Than One Contact with the Given Broker Id Exist, Please Call The Technical Team.', null, 409);
            }
        } else {
            return null;
        }
    } catch (err) {
        console.log(err);
        if (err instanceof salesforceException) {
            throw err;
        } else {
            throw new salesforceException('Error In Getting Agent with given Broker Id', err, 500);
        }
    }

}


async function getPartnerForMatchMakeController(sfConn, oppId, role) {
    let param = "?" + "role=" + role + "&" + "oppId=" + oppId;
    
    // Error handeled in parent middleware.
    let result = await sfConn.apex.get("/getPartnersForMatchMake" + param);

    return result;
}

async function manualMatchMakingController(sfConn, oppId, partnersId, role) {
    let body = {
        "opp_id": oppId,
        "partners_id": partnersId,
        "role": role
    }
    // Error handeled in parent middleware.
    let result = await sfConn.apex.post("/manualMatchMake", body);

    return result;
}

module.exports = {
    login,
    getAgentContactDetailByAgentId,
    getPartnerForMatchMakeController,
    manualMatchMakingController
}