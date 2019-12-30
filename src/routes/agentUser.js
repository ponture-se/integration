const express = require('express');
const router = express.Router();
const agentUserMW = require('../middlewares/sfMiddlewares/agentUserMW');
const validate = require("../middlewares/validate");
const agentUserValidationRules = require("../models/agentUserModel");
var auth = require("../controllers/auth");


router.post('/login',
            agentUserValidationRules.loginValidation(),
            validate,
            auth.getSalesForceToken,
            agentUserMW.loginApi);


module.exports = router;