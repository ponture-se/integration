const express = require('express');
const router = express.Router();
const userMW = require('../middlewares/sfMiddlewares/userMW');
const validate = require("../middlewares/validate");
const userModel = require("../models/userModel");
var auth = require("../controllers/auth");


router.post('/login',
            auth.noAuthNeeded,
            userModel.loginValidation(),
            validate,
            auth.getSalesForceToken,
            userMW.loginApi);



module.exports = router;