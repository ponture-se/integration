const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();
// const myToolkit = require('../controllers/myToolkit');
// const fileController = require('../controllers/fileController');
const fileMW = require('../middlewares/sfMiddlewares/fileMW');
const getSFConnection = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const fileValidationRules = require("../models/fileModel");
// var auth = require("../controllers/auth");
const multer = require('multer');

const fileSizeLimit = parseInt(process.env.FILE_SIZE_LIMIT) || 10500000;

let upload = multer({ dest: 'tempStorage/',
                        limits: { fileSize: fileSizeLimit },
                        fileFilter: fileMW.fileFilter})
                        .single('file');
            
router.post('/upload',
            getSFConnection,
            // fileValidationRules.fileUploadValidation(),
            // validate,
            function (req, res, next){
                upload(req, res, (err) => fileMW.uploadErrorHandler(err, req, res, next));
            },
            fileMW.uploadFileExtraValidation,
            fileMW.uploadFile);


module.exports = router;