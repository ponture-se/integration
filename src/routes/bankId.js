var express = require('express');
var router = express.Router();
var controller = require('../controllers/bankIdController');

router.post("/start", controller.start);
router.get("/collect", controller.collect);
router.post("/cancel", controller.cancel);
router.post("/sign", controller.sign);

module.exports = router;