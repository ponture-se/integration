var express = require("express");
var router = express.Router();
var controller = require("../controllers/bankIdController");
var auth = require("../controllers/auth");

router.post("/login", auth.noAuthNeeded, auth.getSalesForceToken, auth.login);
router.post("/token", auth.noAuthNeeded, controller.authenticate);
router.get("/collect", auth.verifyToken, controller.collect);
router.post("/cancel", auth.verifyToken, controller.cancel);
router.post("/sign", auth.noAuthNeeded, controller.sign);

module.exports = router;
