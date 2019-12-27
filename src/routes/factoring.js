const express = require('express');
const router = express.Router();
const getSFConnection = require("../middlewares/sfMiddleware");
const factoringMW = require("../middlewares/sfMiddlewares/factoringMW");
const factoringController = require('../controllers/factoringController');
const validate = require("../middlewares/validate");
const factoringModel = require("../models/factoringModel");


router.post('/submit',
            factoringModel.factoringSubmitValidationRules(),
            validate,
            getSFConnection,
            factoringMW.getFacoringRecordTypeId,
            factoringController.submitFactoring);


router.get('/requests',
            factoringModel.factoringRequestsValidation(),
            validate,
            getSFConnection,
            factoringMW.getFacoringRecordTypeId,
            factoringController.getCustomerFactoringApplications);

router.get('/open',
            factoringModel.factoringOpenDetailsValidation(),
            validate,
            getSFConnection,
            factoringMW.getFacoringRecordTypeId,
            factoringController.openFactoringOpp);

router.put('/cancelApplication',
            factoringModel.factoringCancelAppValidation(),
            validate,
            getSFConnection,
            factoringMW.getFacoringRecordTypeId,
            factoringController.cancelFactoringApp);

module.exports = router;