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
    body('assign').exists().withMessage("Required Key/Value Pair")
                      .isArray().withMessage("Value Must be Array"),
    body('unassign').exists().withMessage("Required Key/Value Pair")
                      .isArray().withMessage("Value Must be Array"),
    body('with_submit').isBoolean().withMessage('It Should be boolean')
                  .isIn([true, false]).withMessage("Valid Values are: true, false")
                  .exists().withMessage("Required Key/Value Pair")
                  .notEmpty().withMessage("Can not be Empty"),

	];
}

function closeSPOValidation() {
	return [
		query('spoId').isString().withMessage('It Should be String')
            .exists().withMessage("Required Key/Value Pair")
            .trim()
            .notEmpty().withMessage("Can not be Empty")
	];
}


module.exports = {
  loginValidation,
  getPartnerForMatchMakeValidation,
  manualMatchMakingValidation,
  closeSPOValidation
}