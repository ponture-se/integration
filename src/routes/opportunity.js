var express = require('express');
var router = express.Router();
var controller = require('../controllers/opportunityController');
var auth = require('../controllers/auth');

router.get("/companies", auth.verifyToken, controller.getCompanies);
router.post("/submit", auth.getToken, controller.submit);

module.exports = router;