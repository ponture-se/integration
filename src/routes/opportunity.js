var express = require('express');
var router = express.Router();
var controller = require('../controllers/opportunityController');
var auth = require('../controllers/auth');

router.get("/needslist", controller.getNeedsList);
router.get("/companies", auth.verifyToken, auth.getRoaringToken, controller.getCompanies);
router.post("/submit", auth.verifyToken, auth.getSalesForceToken, controller.submit);

module.exports = router;