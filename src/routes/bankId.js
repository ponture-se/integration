var express = require("express");
var router = express.Router();
var controller = require("../controllers/bankIdController");
let bankIdMw = require("../middlewares/bankIdMW");
var auth = require("../controllers/auth");
const getSFConnection = require("../middlewares/sfMiddleware");
const bankIdModel = require("../models/bankIdModel");
const validate = require("../middlewares/validate");

router.post("/login", auth.noAuthNeeded, auth.getSalesForceToken, auth.login);
router.post("/token", auth.noAuthNeeded, controller.authenticate);
router.post("/tokenWithOppId", 
            auth.noAuthNeeded,
            bankIdModel.tokenWithOppIdValidationModel(),
            validate,
            getSFConnection,
            bankIdMw.checkOppForBankIdVerification,
            controller.authenticate);

router.post("/checkCriteria", 
            auth.noAuthNeeded,
            bankIdModel.tokenWithOppIdValidationModel(),
            validate,
            getSFConnection,
            bankIdMw.checkOppForBankIdVerification,
            bankIdMw.returnCheckCriteriaResponse);

router.get("/collect", auth.verifyToken, controller.collect);
router.post("/cancel", auth.verifyToken, controller.cancel);
router.post("/sign", auth.noAuthNeeded, controller.sign);

module.exports = router;
