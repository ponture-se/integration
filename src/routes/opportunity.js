var express = require("express");
var router = express.Router();
var controller = require("../controllers/opportunityController");
var auth = require("../controllers/auth");

router.get("/needslist", auth.getSalesForceToken, controller.getNeedsList);
router.get(
  "/companies",
  auth.verifyToken,
  auth.getRoaringToken,
  controller.getCompanies
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
module.exports = router;
