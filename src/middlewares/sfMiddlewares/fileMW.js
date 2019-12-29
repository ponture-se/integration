const fileController = require('../../controllers/fileController');
const myResponse = require('../../controllers/myResponse');
const apiLogger = require('../apiLogger');

async function uploadFile(req, res, next) {
    let resBody;

    const sfConn = req.needs.sfConn;

    const title = req.body.title,
            fileExtension = req.body.fileExtension,
            content = req.body.content;

    try {
        const result = await fileController.insertFileInSf(sfConn, title, fileExtension, content);

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


module.exports = {
    uploadFile
}