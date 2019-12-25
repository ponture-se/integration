const myToolkit = require('../controllers/myToolkit');
const queryHelper = require("./sfHelpers/queryHelper");
const _ = require("lodash");


async function getContentDocumentIds(targetIds, sfConn = undefined){
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
}

async function getContentVersion(cdIds, sfConn = undefined){
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
}

async function getAttachedFilesinfo(targetIds, sfConn = undefined){
    if (sfConn == undefined){
        sfConn = await myToolkit.makeSFConnection();
        if (sfConn == null){
            return null;
        }
    }

    let cdsInfo = await getContentDocumentIds(targetIds, sfConn);
    let cdIds = cdsInfo.map(item => item.cdId);
    let cvsInfo = await getContentVersion(cdIds, sfConn);

    let mergeList = _.merge(cdsInfo, cvsInfo);
    let result = _.mapValues(_.groupBy(mergeList, 'targetId'),
                            clist => clist.map(item => _.omit(item, ['targetId', 'cdId'])));
    
    return result;
}

module.exports = {
    getAttachedFilesinfo
}