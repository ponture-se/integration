const express = require('express');
const router = express.Router();
const myToolkit = require('../controllers/myToolkit');
const leadController = require('../controllers/leadController');
const sfConn = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const leadValidationRules = require("../models/leadModel");
const apiLogger = require('../middlewares/apiLogger');
// var auth = require("../controllers/auth");

router.get('/:id', sfConn, leadController.getLead);
router.post('/create', 
            sfConn,
            leadValidationRules(), 
            validate,
            // auth.noAuthNeeded,
            // auth.getRoaringToken,
            leadController.createLead,
            apiLogger);


module.exports = router;