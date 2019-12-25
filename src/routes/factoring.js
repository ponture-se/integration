const express = require('express');
const router = express.Router();
const factoringController = require('../controllers/factoringController');
const validate = require("../middlewares/validate");
const factoringModel = require("../models/factoringModel");


router.post('/submit', 
            factoringModel.factoringSubmitValidationRules(),
            validate,
            factoringController.submitFactoring);


router.get('/requests',
            factoringModel.factoringRequestsValidation(),
            validate,
            factoringController.getCustomerFactoringApplications);


module.exports = router;