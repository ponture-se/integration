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
                                            fileExtension : item.FileExtension
                                            };
                                        });
        
        return cvsInfo;
    } catch(e) {
        console.log("getContentVersion:", e);
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


module.exports = {
    getAttachedFilesinfo,
    insertFileInSf
}