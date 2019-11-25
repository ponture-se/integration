const express = require('express');
const router = express.Router();
const myToolkit = require('../controllers/myToolkit');
const leadController = require('../controllers/leadController');
const sfConn = require("../middlewares/sfMiddleware");
const validate = require("../middlewares/validate");
const leadValidationRules = require("../models/leadModel");

router.get('/:id', sfConn, leadController.getLead);
router.post('/create', sfConn, leadValidationRules(), validate,  leadController.createLead);


module.exports = router;