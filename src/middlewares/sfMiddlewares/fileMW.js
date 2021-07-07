const fileController = require('../../controllers/fileController');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');
const logger = require('../../controllers/customeLogger');
const multer = require('multer');
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();



async function uploadFile(req, res, next) {
    let resBody;
    const sfConn = req.needs.sfConn;

    const file = req.file;

    if (!file) {
        resBody = myResponse(false, null, 400, 'No file attached');
        res.status(400).send(resBody);
        res.body = resBody;			// For logging purpose
        
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    }

    try {
        const result = await fileController.insertFileInSf(sfConn, file);

        if (result.success) {
            resBody = myResponse(true, result.data, 200);
            res.status(200).send(resBody);
            res.body = resBody;			// For logging purpose
            
            return next();
        } else {
            resBody = myResponse(false, null, 500 , result.msg, result.error);
            res.status(500).send(resBody);
            res.body = resBody;			// For logging purpose
            
            return apiLogger(req, res, () => {return;});			//instead of calling next()
        }
    } catch (err) {
        resBody = myResponse(false, null, 500 , 'Something went wrong', err);
        res.status(500).send(resBody);
        res.body = resBody;			// For logging purpose
        
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    }
}



function uploadFileExtraValidation(req, res, next){
    let resBody,
        validationError = false;

    if (!req.file) {
        resBody = myResponse(false, null, 400, 'No file attached');
        res.status(400).send(resBody);

        validationError = true;
    }

    if (validationError) {
        res.body = resBody;			// For logging purpose
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    } else {
        return next();
    }
}


function uploadErrorHandler(err, req, res, next) {
    let resBody;
    if (err instanceof multer.MulterError) {
        resBody = myResponse(false, null, 500, err.message);
        res.status(500).send(resBody);

        res.body = resBody;
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    } else if (err) {
        logger.error('File ERROR', {metadata: err});
        resBody = myResponse(false, null, 500, 'Something went wrong', err.message);
        res.status(500).send(resBody);

        res.body = resBody;
        return apiLogger(req, res, () => {return;});			//instead of calling next()
    } else {
        next();
    }
}

function fileFilter (req, file, callback) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|pdf|txt|doc|docx|ppt|pptx|xls|xlsx)$/)) {
      return callback(new Error('File type is Invalid!'), false);
    }

    callback(null, true);
}

async function downloadFile(req, res, next) {
    let resBody;
    let sfConn = req.needs.sfConn;
    let fileId = req.params.fileId;

    // let fileData = await fileController.getContentVersionWithFileId(fileId, sfConn);
    fileId = fileId.split('.')[0];
    let fileData = await fileController.getContentVersionWithCustomFileId(fileId, sfConn);

    if (fileData == null) {
        resBody = myResponse(false, null, 500, 'Can not get file. Please recheck file Id and try again.');
        res.status(500).send(resBody);
        return next();
    } else {
        let fileName = Date.now().toString() + ' ' + fileData.title;

        try {
            await fileController.downloadFileAsStream(fileData.id, fileName, sfConn, function (err) {
                if (err) {
                    resBody = myResponse(false, null, 500, 'downloadFile Func Throw Error', err);
                    logger.error('downloadFile Func Throw Error', {metadata: resBody});
        
                    res.status(500).send(resBody);
                    return next();
                } else {
                    let fileAddr = './tempStorage/' + fileName;
                    res.status(200).download(fileAddr);
                }
                
            });
        } catch (err) {
            resBody = myResponse(false, null, err.statusCode || 500, err.message, err);
            res.status(resBody.statusCode).send(resBody);
            return next();
        }
    }

}


module.exports = {
    uploadFile,
    uploadFileExtraValidation,
    uploadErrorHandler,
    fileFilter,
    downloadFile
}