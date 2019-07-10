var express = require('express');
var router = express.Router();
var controller = require('../controllers/bankIdController');
var auth = require('../controllers/auth');

router.post("/start", controller.authenticate);
router.get("/collect", controller.collect);
router.post("/cancel", controller.cancel);
router.post("/sign", controller.sign);

module.exports = router;