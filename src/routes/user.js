const express = require('express');
const router = express.Router();
const userMW = require('../middlewares/sfMiddlewares/userMW');
const validate = require("../middlewares/validate");
const userValidationRules = require("../models/userModel");
const getSFConnection = require("../middlewares/sfMiddleware");
var auth = require("../controllers/auth");



router.post('/login',
            auth.noAuthNeeded,
            userValidationRules.loginValidation(),
            validate,
            auth.getSalesForceToken,
            userMW.loginApi);
            
            
router.get('/getPartnersForMatchMake',
            auth.verifyToken,
            userValidationRules.getPartnerForMatchMakeValidation(),
            validate,
            getSFConnection,
            userMW.getPartnerForMatchMakeAPI);

router.post('/manualMatchMaking',
            auth.verifyToken,
            userValidationRules.manualMatchMakingValidation(),
            validate,
            getSFConnection,
            userMW.doManualMatchMakingAPI);


module.exports = router;