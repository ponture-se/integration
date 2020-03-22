const { body, query } = require('express-validator');


function loginValidation(){
    return [
        body('username').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .notEmpty().withMessage("Can not be Empty"),
        body('password').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .notEmpty().withMessage("Can not be Empty"),
    ];
  }


function getPartnerForMatchMakeValidation() {
	return [
		query('oppId').isString().withMessage('It Should be String')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .notEmpty().withMessage("Can not be Empty")
	];
}


function manualMatchMakingValidation() {
	return [
		body('opp_id').isString().withMessage('It Should be String')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .notEmpty().withMessage("Can not be Empty"),
    body('partners_id').exists().withMessage("Required Key/Value Pair")
                      .isLength({
                        min: 1
                      }).withMessage("At least one value should exist")
                      .isArray().withMessage("Value Must be Array")

	];
}
  module.exports = {
	loginValidation,
  getPartnerForMatchMakeValidation,
  manualMatchMakingValidation
  }