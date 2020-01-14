const express = require('express');
const router = express.Router();
// const myToolkit = require('../controllers/myToolkit');
// const fileController = require('../controllers/fileController');
const fileMW = require('../middlewares/sfMiddlewares/fileMW');
const getSFConnection = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const fileValidationRules = require("../models/fileModel");
// var auth = require("../controllers/auth");
const multer = require('multer');
var upload = multer({ dest: 'tempStorage/' })
            
router.post('/upload',
            getSFConnection,
            // fileValidationRules.fileUploadValidation(),
            // validate,
            upload.single('file'),
            fileMW.uploadFile);


module.exports = router;