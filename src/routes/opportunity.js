var express = require("express");
var router = express.Router();
var controller = require("../controllers/opportunityController");
var auth = require("../controllers/auth");
let opportunityValidationRules = require('../models/opportunityModel');
const validate = require("../middlewares/validate");
const getSFConnection = require("../middlewares/sfMiddleware");
const opportunityMW = require("../middlewares/sfMiddlewares/opportunityMW");

router.get("/needslist", auth.getSalesForceToken, controller.getNeedsList);
router.get(
  "/companies",
  // auth.verifyToken,
  auth.noAuthNeeded,
  auth.getRoaringToken,
  opportunityMW.getCompaniesList
);


router.post(
  "/submit",
  auth.verifyToken,
  auth.getRoaringToken,
  auth.getSalesForceToken,
  controller.submit
);

router.get(
  "/requests",
  auth.verifyToken,
  auth.getSalesForceToken,
  controller.myrequests
);

router.get(
  "/:oppId/offers",
  auth.verifyToken,
  auth.getSalesForceToken,
  controller.getOffers
);
router.put(
  "/acceptoffer",
  auth.verifyToken,
  auth.getSalesForceToken,
  controller.acceptOffer
);
router.put(
  "/rejectoffer",
  auth.verifyToken,
  auth.getSalesForceToken,
  controller.rejectOffer
);
router.put(
  "/:oppId/cancel",
  auth.verifyToken,
  auth.getSalesForceToken,
  controller.cancel
);


router.post(
  "/saveApp",
  auth.verifyToken,
  opportunityValidationRules.saveAppValidation(),
  validate,
  getSFConnection,
  opportunityMW.saveAppExtraValidation,
  opportunityMW.saveApplicationApi
);


module.exports = router;
