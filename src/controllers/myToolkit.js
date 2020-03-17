const response = require("../controllers/myResponse");
const bodyParser = require("body-parser");
const jsforce = require('jsforce');
const dotenv = require('dotenv');
const crypto = require('crypto');
// Encryption data
const passString = process.env.ENCRYPTION_KEY || 'defaultPa5Sword!@#';
const key = crypto.createHash('sha256').update(String(passString)).digest('base64').substr(0, 32);
const iv = crypto.randomBytes(16);

dotenv.config();

async function getRecordTypeId(sfConn, sObjName, recordTypeName){
    let result;
    
    try{
        let sObjDescribe = await sfConn.sobject(sObjName).describe();
        let recordTypesList = sObjDescribe.recordTypeInfos;
        result = recordTypesList.find(o => o.name === recordTypeName).recordTypeId;
    } catch(err) {
        result = null;
    }

    return result;

    // sfConn.sobject(sObjName).describe(function(err, ret){
    //     console.log(err);
    //     let recordTypesList = ret.recordTypeInfos;
    //     let result = recordTypesList.find(o => o.name === recordTypeName);
        
    //     return result.recordTypeId;
    // });

}

async function getRecordTypeName(sfConn, sObjName, recordTypeId){
    let result;
    
    let sObjDescribe = await sfConn.sobject(sObjName).describe();
    let recordTypesList = sObjDescribe.recordTypeInfos;
    result = recordTypesList.find(o => o.recordTypeId == recordTypeId).name;

    return result;
}

function isJSON(req, res, next){
    bodyParser.json()(req, res, err => {
        if (err) {
            let jsonRes = response(false, null, 400, "Invalid JSON.");
            return res.status(400).send(jsonRes); // Bad request
        }

        next();
    });
}


function fixPhoneNumber(phone){
    let result = '';
    if (phone.startsWith('00')){
        result = '+' + phone.slice(2);
    } else if (phone.startsWith('0')){
        result = '+46' + phone.slice(1);
    } else {
        // phone must be start with +46
        result = phone;
    }

    return result;
}


async function makeSFConnection(){
    const conn = new jsforce.Connection({loginUrl : process.env.LOGIN_API_ROOT,
                                        clientId : process.env.SALESFORCE_CLIENTID,
                                        clientSecret: process.env.SALESFORCE_CLIENT_SECRET});

    try{
        const sfConnection = await conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD);
        return conn;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function addPairToReqNeeds(req, key, value){
    if (req.hasOwnProperty('needs')){
        req.needs[key] = value;
    } else {
        req.needs = {};
        req.needs[key] = value;
    }
    return;
}

function checkJwtTokenEssentialData(jwtData, essentialData) {
    let unseenData = [];
    if (!Array.isArray(essentialData)) {
        essentialData = [essentialData];
    }

    essentialData.forEach(el => {
        if(!jwtData.hasOwnProperty(el)) {
            unseenData.push(el);
        }
    });

    return unseenData;
}


function getFormattedDate() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();

    return str;
}

function encryptData(data) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}

function decrypt(text) {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
   }



module.exports = {
    getRecordTypeId,
    getRecordTypeName,
    isJSON,
    fixPhoneNumber,
    makeSFConnection,
    addPairToReqNeeds,
    getFormattedDate,
    checkJwtTokenEssentialData,
    encryptData,
    decrypt
}