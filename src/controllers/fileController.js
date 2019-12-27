const myToolkit = require('./myToolkit');
const queryHelper = require('./sfHelpers/queryHelper');
const fResult = require('./functionResult');
const _ = require("lodash");

async function insertFileInSf(sfConn, title, fileExtension, content){
    let result;

    let payload = {
        Title : title,
        PathOnClient : 'file_' + Date.now() + '.' + fileExtension,
        VersionData : content
    };
    
    try{
        let ret = await sfConn.sobject('ContentVersion').create(payload);
        if (ret.success){
            result = fResult(true, {id : ret.id});
        } else {
            console.log('File could not created.', ret.errors);
            result = fResult(false, null , ret.errors, 'File could not created.');
        }
    } catch (err) {
        console.log('File could not created.', err);
        result = fResult(false, null , err, 'File could not created.');
    }

    return result;
}




exports = {
    insertFileInSf
}