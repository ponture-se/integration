var express = require("express");
var router = express.Router();
var controller = require("../controllers/opportunityController");
var auth = require("../controllers/auth");
let opportunityValidationRules = require('../models/opportunityModel');
const validate = require("../middlewares/validate");
const getSFConnection = require("../middlewares/sfMiddleware");
const opportunityMW = require("../middlewares/sfMiddlewares/opportunityMW");
const bankIdMW = require("../middlewares/bankIdMW");

router.get("/needslist", auth.getSalesForceToken, controller.getNeedsList);

router.get(
  "/companies",
  // auth.verifyToken,
  // auth.noAuthNeeded,
  auth.getRoaringToken,
  controller.getCompanies
  // opportunityMW.getCompaniesList
);


router.post(
  "/submit",
  auth.verifyToken,
  auth.getRoaringToken,
  auth.getSalesForceToken,
  getSFConnection,
  opportunityMW.saveAppBeforeSubmit,
  opportunityMW.fillRequestOfSavedOpp,
  opportunityValidationRules.submitValidation(),
  validate,
  controller.submit
);

router.post(
  "/submit/v2",
  auth.verifyToken,
  auth.getRoaringToken,
  auth.getSalesForceToken,
  getSFConnection,
  // opportunityMW.saveAppBeforeSubmit,
  opportunityMW.fillSubmitReqBodyFromExistingOppMw,
  opportunityValidationRules.submitV2Validation(),
  validate,
  bankIdMW.checkOppForBankIdVerification,
  opportunityMW.fillReqWithRoaringData,
  opportunityMW.submit_v2
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
  opportunityValidationRules.acceptOfferValidation(),
  validate,
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
  opportunityMW.authMwDecision,
  opportunityValidationRules.saveAppValidation(),
  validate,
  getSFConnection,
  opportunityMW.saveAppExtraValidation,
  opportunityMW.prepareSavePayload,
  opportunityMW.saveApplicationApi
);

router.get(
  "/offersOfLatestOpp",
  auth.verifyToken,
  opportunityValidationRules.offersOfLatestOppValidation(),
  validate,
  getSFConnection,
  opportunityMW.offersOfLatestOppApi
);

router.get(
  "/offersOfLatestOpp/v2",
  auth.verifyToken,
  opportunityValidationRules.offersOfLatestOppV2Validation(),
  validate,
  getSFConnection,
  opportunityMW.offersOfLatestOppV2Api
);


router.post(
  "/createOpp",
  // auth.verifyToken,
  opportunityValidationRules.createOppValidation(),
  validate,
  auth.getRoaringToken,
  // opportunityMW.fillReqWithRoaringData,
  getSFConnection,
  opportunityMW.checkIfBankIdVerificationNeeded,
  opportunityMW.createOpportunityMw
);

module.exports = router;
