const myToolkit = require('../../controllers/myToolkit');
const agentUserController = require('../../controllers/agentUserController');
const myResponse = require('../../controllers/myResponse');

async function loginApi(req, res, next) {
    let username = req.body.username,
        password = req.body.password,
        sfToken = req.sf_access_token;
    let resBody;

    try {
        const result = await agentUserController.login(sfToken, username, password);
        if (result.success) {
            resBody = result.data;      // Salesforce response
            res.status(200).send(resBody);
            res.body = resBody;			// For logging purpose
        } else {
            let error = result.data;
            
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.log(error.response.data);
                console.log(error.response.status);
                console.log(error.response.headers);
                
                res.status(error.response.status).send(error.response.data);
                res.body = error.response.data;
              
            } else if (error.request) {
                // The request was made but no response was received
                // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                // http.ClientRequest in node.js
                console.log(error.request);
                let msg = "Some problems with request.";
                res.status(500).send(msg);
                res.body = msg;			// For logging purpose
              
            } else {
                // Something happened in setting up the request that triggered an Error
                console.log("Error", error.message);
                res.status(500).send(error.message);
                res.body = error.message;			// For logging purpose
              }
        }

        return next();
    
    } catch (err) {
        resBody = myResponse(false, null, 500 , 'Something went wrong', err);
        res.status(500).send(resBody);
        res.body = resBody;			// For logging purpose
        
        return next();
    }

}

module.exports = {
    loginApi
}