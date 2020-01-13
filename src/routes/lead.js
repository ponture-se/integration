const express = require('express');
const router = express.Router();
const myToolkit = require('../controllers/myToolkit');
const leadController = require('../controllers/leadController');
const getSFConnection = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const leadValidationRules = require("../models/leadModel");
var auth = require("../controllers/auth");

router.get('/:id',
            getSFConnection,
            leadController.getLead);
            
router.post('/create',
            auth.noAuthNeeded,
            getSFConnection,
            leadValidationRules(), 
            validate,
            leadController.createLead);


module.exports = router;