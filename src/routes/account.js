var express = require("express");
var router = express.Router();
var controller = require("../controllers/accountController");
var auth = require("../controllers/auth");

router.get(
  "/getcompanyinfo",
  // auth.noAuthNeeded,
  auth.getRoaringToken,
  controller.getcompanyinfo
);

module.exports = router;
