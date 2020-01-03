const { body, oneOf } = require('express-validator');


function saveAppValidation(){
  return [
    oneOf([
      [
        body('orgNumber').isNumeric().withMessage('It Should be Numeric')
                      .exists().withMessage("Required Key/Value Pair")
                      .notEmpty().withMessage("Can not be Empty"),
        body('orgName').isString().withMessage('It Should be String')
                      .exists().withMessage("Required Key/Value Pair")
                      .notEmpty().withMessage("Can not be Empty")
      ],
      body('need').exists().withMessage("Required Key/Value Pair")
        .isLength({ min: 1 }).withMessage("At least one value should exist")
        .isArray().withMessage("Value Must be Array")
        .isIn(['purchase_of_business'])
      ], "'orgName' & 'orgNumber' must exist if 'need' is something different from 'purchase_of_business'"),
    body('personalNumber').isNumeric().withMessage('It Should be Numeric')
                    .exists().withMessage("Required Key/Value Pair")
                    .notEmpty().withMessage("Can not be Empty"),
    body('lastName').isString().withMessage('It Should be String')
                    .exists().withMessage("Required Key/Value Pair")
                    .notEmpty().withMessage("Can not be Empty"),
    body('firstName').isString().withMessage('It Should be String').optional(),
    body('email').isEmail().withMessage('It Should be an Email').optional(),
    body('phoneNumber').isNumeric().withMessage("Value Must be Numeric.")
                        .matches(/^(\+?46|0|0046)[\s\-]?[1-9][\s\-]?[0-9]([\s\-]?\d){6,7}$/).withMessage('Invalid Pattern.')
                        .optional(),
    body('need').exists().withMessage("Required Key/Value Pair")
                        .isLength({ min: 1 }).withMessage("At least one value should exist")
                        .isArray().withMessage("Value Must be Array"),                     
    body('needDescription').isString().withMessage('It Should be String').optional(),
    body('oppId').isString().withMessage('It Should be String').optional()
    ];
  }

  module.exports = {
    saveAppValidation
  }