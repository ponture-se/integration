const myToolkit = require('./myToolkit');
const queryHelper = require('./sfHelpers/queryHelper');
const fResult = require('./functionResult');
const _ = require("lodash");
const crudHelper = require('./sfHelpers/crudHelper');
const mime = require('mime-types');
const { salesforceException, externalCalloutException } = require('./customeException');
const fs = require('fs');
const mlog = require('./customeLogger');
const axios = require('axios');
const logger = require('./customeLogger');


// async function insertFileInSf(sfConn, title, fileExtension, content){
//     let result;

//     fileExtension = mime.extension(fileExtension);
//     content = content.split('base64,')[1] || content;

//     let payload = {
//         Title : title,
//         PathOnClient : 'file_' + Date.now() + '.' + fileExtension,
//         VersionData : content
//     };
    
//     try{
//         let ret = await sfConn.sobject('ContentVersion').create(payload);
//         if (ret.success){
//             result = fResult(true, {id : ret.id});
//         } else {
//             console.log('File could not created.', ret.errors);
//             result = fResult(false, null , ret.errors, 'File could not created.');
//         }
//     } catch (err) {
//         console.log('File could not created.', err);
//         result = fResult(false, null , err, 'File could not created.');
//     }

//     return result;
// }


async function insertFileInSf(sfConn, file){
    let result;

    try{
        title = file.originalname;
        fileExtension = mime.extension(file.mimetype) || '';
        content = fs.readFileSync(file.path);

        let payload = {
            Title : title,
            PathOnClient : 'file_' + Date.now() + '.' + fileExtension,
            VersionData : content.toString('base64')
        };

        let ret = await sfConn.sobject('ContentVersion').create(payload);
        let fileInfo = await queryHelper.getSingleQueryResult(sfConn, 'ContentVersion', {Id : ret.id});

        if (ret.success && fileInfo){
            result = fResult(true, {id : fileInfo.File_ID__c + '.' + fileExtension});
        } else {
            console.log('File could not created.', ret.errors);
            result = fResult(false, null , ret.errors, 'File could not created.');
        }
    } catch (err) {
        console.log('File could not created.', err);
        result = fResult(false, null , err, 'File could not created.');
    }

    // remove file after uploading. whether it upload successfully or not.
    fs.unlink(file.path, (err) => {
        if (err) {
            mlog.error('Error occured when removing file from storage', {
                metadata: {error: err}
            });
        }
    });

    return result;
}


async function getContentDocumentIds(targetIds, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }

        let where = {LinkedEntityId : targetIds};

        let cdList = await queryHelper.getQueryResult(sfConn, "ContentDocumentLink", where);
        let cdsInfo = cdList.map(item => {
                                        return {
                                            targetId : item.LinkedEntityId,
                                            cdId: item.ContentDocumentId
                                            };
                                        });
        
        return cdsInfo;
    } catch(e){
        console.log("getContentDocumentIds:", e);
        return null;
    }
}

async function getContentVersion(cdIds, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }

        let where = {ContentDocumentId : cdIds};

        let cvList = await queryHelper.getQueryResult(sfConn, "ContentVersion", where);
        let cvsInfo = cvList.map(item => {
                                        return {
                                            cdId: item.ContentDocumentId,
                                            id : item.Id,
                                            title : item.Title,
                                            fileExtension : item.FileExtension,
                                            content: item.VersionData
                                            };
                                        });
        console.log(cvsInfo);
        return cvsInfo;
    } catch(e) {
        console.log("getContentVersion:", e);
        return null;
    }
}

async function getContentVersionWithFileId(fileId, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }

        let where = {Id : fileId};

        let cvItem = await queryHelper.getSingleQueryResult(sfConn, "ContentVersion", where);
        let cvsInfo = {
                            cdId: cvItem.ContentDocumentId,
                            id : cvItem.Id,
                            title : cvItem.Title,
                            fileExtension : cvItem.FileExtension,
                            content: cvItem.VersionData
                        };
        
        return cvsInfo;
    } catch(e) {
        console.log("getContentVersionWithFileId:", e);
        return null;
    }
}



async function getContentVersionWithCustomFileId(fileId, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }

        let where = {File_ID__c : fileId};

        let cvItem = await queryHelper.getSingleQueryResult(sfConn, "ContentVersion", where);
        let cvsInfo = {
                            cdId: cvItem.ContentDocumentId,
                            id : cvItem.Id,
                            title : cvItem.Title,
                            fileExtension : cvItem.FileExtension,
                            content: cvItem.VersionData
                        };
        
        return cvsInfo;
    } catch(e) {
        console.log("getContentVersionWithFileId:", e);
        return null;
    }
}

async function getAttachedFilesinfo(targetIds, sfConn = undefined){
    try{
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }
    
        let cdsInfo = await getContentDocumentIds(targetIds, sfConn);
        if (cdsInfo == null) return null;

        let cdIds = cdsInfo.map(item => item.cdId);
        let cvsInfo = await getContentVersion(cdIds, sfConn);
        if (cvsInfo == null) return null;

        let mergeList = _.merge(cdsInfo, cvsInfo);
        let result = _.mapValues(_.groupBy(mergeList, 'targetId'),
                                clist => clist.map(item => _.omit(item, ['targetId', 'cdId'])));
        
        return result;
    } catch (e) {
        console.log('getAttachedFilesinfo', e);
        return null;
    }
}


async function assignFileToTargetRecord(fileIds, targetId, sfConn = undefined) {
    try {
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }
        
        let payload = [];
        
        // let files = await crudHelper.readSobjectInSf(sfConn, 'ContentVersion', fileIds);
        let trueFileIds = fileIds.map(item => {if (item instanceof String) return item.split('.')[0]});
        let files = await queryHelper.getQueryResult(sfConn, 'ContentVersion', {File_ID__c: trueFileIds});


        files.forEach(f => {
            if (f != null) {
                payload.push({
                    ContentDocumentId : f.ContentDocumentId,
                    LinkedEntityId : targetId,
                    ShareType : 'V'
                });
            }
        });


        let result = await crudHelper.insertSobjectInSf(sfConn, 'ContentDocumentLink', payload);

        if (result) {
            return result;
        } else {
            throw new salesforceException("The file can not be assign to the target record.", null, 500);
        }
    } catch (error) {
        if (error instanceof salesforceException) {
            throw error;
        } else {
            throw new salesforceException("Something wents wrong.", error, 500);
        }
    }
}

async function detachedAllFilesFromTargetId(targetId, sfConn = undefined) {
    try {
        if (sfConn == undefined){
            sfConn = await myToolkit.makeSFConnection();
            if (sfConn == null){
                return null;
            }
        }
        
        let result;
        
        let files = await queryHelper.getQueryResult(sfConn, 'ContentDocumentLink', {LinkedEntityId: targetId});
        let payload = files.map(item => item.Id);
        
        if (payload) {
            result = await crudHelper.deleteSobjecInSf(sfConn, 'ContentDocumentLink', payload);
        } else {
            result = [];
        }

        return result;
    } catch (error) {
        if (error instanceof salesforceException) {
            throw error;
        } else {
            throw new salesforceException("Something wents wrong.", error, 500);
        }
    }
}


async function downloadFileAsStream(fileId, fileName, sfConn, callback) {
    // body payload structure is depending to the Apex REST method interface.
    var param = "?id=" + fileId;
    let result;
    try {
        result = await sfConn.apex.get("/getFile" + param);

        fs.mkdir('./tempStorage/', { recursive: true }, (err) => {
            if (err) throw err;
        });

        fs.writeFile('./tempStorage/' + fileName, result.data.content, {encoding: 'base64'}, callback);

    } catch (err) {
        logger.error('downloadFileAsStream Error', { metadata: err });
        throw err;
    }

}

module.exports = {
    downloadFileAsStream,
    getAttachedFilesinfo,
    insertFileInSf,
    assignFileToTargetRecord,
    detachedAllFilesFromTargetId,
    getContentVersionWithFileId,
    getContentVersionWithCustomFileId
}