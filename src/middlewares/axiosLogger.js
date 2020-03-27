const axios = require("axios");
const winston = require("winston");
require('winston-mongodb');
const dotenv = require('dotenv');
dotenv.config();

axios.interceptors.response.use(response => {
    try{
        setDatabaseCollectionName(response.config);
        let data = prepareLogData(response);

        logger(data.logLevel, data.title, data.data);
    } catch (e) {
        console.log('Axios Loggin Error', e);
    }

    return response;
},
error =>{
    try{
        let repsonseOfError = error.response;
        setDatabaseCollectionName(repsonseOfError.config || error.config);
        let data = prepareLogData(repsonseOfError || error);
        
        logger(data.logLevel, data.title, data.data);
    } catch (e) {
        console.log('Axios Loggin Error', e);
    }

    return Promise.reject(error);
});




// Define a mongondb winston logger 
const dbConnString = process.env.LOG_DB_CONNECTION_STRING || "mongodb+srv://backupLogDB:9SEnbWEu2qmGRYpo@cluster0-ljo1h.mongodb.net/backupLogDB?retryWrites=true&w=majority";

const winstonApiLogger = winston.createLogger({
	level: 'silly',
	format: winston.format.json(),
	// defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.MongoDB({
			db: dbConnString,
			level: 'silly',
			options: {
				useUnifiedTopology: true
			},
			collection: process.env.AXIOS_LOGGER_COLLECTION_NAME || 'Axios Default Logs Repo',
			storeHost: true
		})
	]
});


function APIlogger(req, res, next){
    return next();
}

function prepareLogData(response) {
    let recordData;
    
    try {
        let reqObj = response.config
            , resObj = {
                        body: response.data,
                        status: response.status
                    };
        
        recordData = {
                        title: response.request.path,
                        data: {
                            res: resObj,
                            req: reqObj
                        }
                    };
    } catch (e) {
        // Actually response is Error of Axios Here
        recordData = {
            title: (response.config) ? (response.config.url || response.config.baseURL || '') : '' + ' (Axios Rejection)',
            data: {
                is_raw_data: true,
                fullResponseData: response
            }
        }
    }

    try{
        if (response.status >= 500) {
            recordData.logLevel = 'error';
        } else if (response.status >= 400) {
            recordData.logLevel = 'warn';
        } else if (response.status >= 100) {
            recordData.logLevel = 'info';
        } else {
            recordData.logLevel = 'error';
            recordData.real_status_not_found = true;
        }
    } catch (e) {
        recordData.logLevel = 'error';
        recordData.real_status_not_found = true;
        recordData.error_on_getting_status = true;
    }

    return recordData;

}

function logger(logLevel, title, data) {
    try{
        winstonApiLogger.log(logLevel, 
            title,
            {metadata: data}
        );
    } catch (e) {
        console.log("Error Occured when logging using winston. Error:", e );
    }
}

function setDatabaseCollectionName(req) {
    // Note: This is a function which can used to set Collection Names Dynamically.    
    winstonApiLogger.transports[0].collection = process.env.AXIOS_LOGGER_COLLECTION_NAME || 'defaultCollection';

    try{
        let originalUrl = req.baseURL;
        
        if (originalUrl.includes('zignsec')) {
            winstonApiLogger.transports[0].collection = 'BankId Axios Logs';
        } else if (originalUrl.includes('roaring')) {
            winstonApiLogger.transports[0].collection = 'roaring Axios Logs';
        } else if (originalUrl.includes('salesforce')) {
            winstonApiLogger.transports[0].collection = 'Salesforce Axios Logs';
        }
    } catch (e) {
        console.log("Error", e);
    }
}


module.exports = APIlogger;