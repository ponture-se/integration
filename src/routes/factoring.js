const express = require('express');
const router = express.Router();
const factoringController = require('../controllers/factoringController');
const validate = require("../middlewares/validate");
const factoringValidationRules = require("../models/factoringModel");


router.post('/submit', 
            factoringValidationRules(), 
            validate,
            factoringController.submitFactoring);


module.exports = router;