var express = require('express');
var router = express.Router();
var controller = require('../controllers/opportunityController');
var auth = require('../controllers/auth');

router.get("/companies", auth.getRoaringToken, controller.getCompanies);
router.post("/submit", auth.getSalesForceToken, controller.submit);

module.exports = router;