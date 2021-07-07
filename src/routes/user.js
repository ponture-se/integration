const express = require('express');
const router = express.Router();
const userMW = require('../middlewares/sfMiddlewares/userMW');
const validate = require("../middlewares/validate");
const userValidationRules = require("../models/userModel");
const getSFConnection = require("../middlewares/sfMiddleware");
var auth = require("../controllers/auth");



router.post('/adminLogin',
            auth.noAuthNeeded,
            userValidationRules.loginValidation(),
            validate,
            auth.getSalesForceTokenForAdmin,
            (req, res, next) => {
                req.loginRole = 'admin';
                next();
            },
            userMW.loginApi);

router.post('/agentLogin',
            auth.noAuthNeeded,
            userValidationRules.loginValidation(),
            validate,
            auth.getSalesForceToken,
            (req, res, next) => {
                req.loginRole = 'agent';
                next();
            },
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

// router.put('/closeSPO',
//             auth.verifyToken,
//             userValidationRules.closeSPOValidation(),
//             validate,
//             getSFConnection,
//             userMW.closeSpoAPI);


module.exports = router;