const {
	body,
	oneOf
} = require('express-validator');


function saveAppValidation() {
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
				.isLength({
					min: 1
				}).withMessage("At least one value should exist")
				.isArray().withMessage("Value Must be Array")
				.isIn(['purchase_of_business'])
		], "'orgName' & 'orgNumber' must exist if 'need' is something different from 'purchase_of_business'"),
		body('personalNumber').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('amount').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('amourtizationPeriod').isNumeric().withMessage('It Should be Numeric')
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
			.isLength({
				min: 1
			}).withMessage("At least one value should exist")
			.isArray().withMessage("Value Must be Array"),
		body('needDescription').isString().withMessage('It Should be String').optional(),
		body('oppId').isString().withMessage('It Should be String').optional(),
		body('broker_id').isString().withMessage('It Should be String')
			.notEmpty().withMessage("Can not be Empty")
			.optional(),
		// body('acquisition.name')
		// 	.if(body('acquisition').exists())
		// 		.exists().withMessage("Required Key/Value Pair"),
		body('acquisition.object_price')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		body('acquisition.object_industry')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.object_annual_report')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.object_balance_sheet')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.object_income_statement')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.object_valuation_letter')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.account_balance_sheet')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.account_income_statement')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.available_guarantees')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.available_guarantees_description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.purchaser_profile')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.own_investment_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.additional_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.purchase_type')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.additional_files')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array"),
		body('acquisition.business_plan')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array"),
		body('acquisition.own_investment_amount')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		
		body('real_estate.real_estate_type')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String"),
		body('real_estate.real_estate_usage_category')
			.if(body('real_estate').exists())
			.isArray().withMessage("Value Must be Array"),	
		body('real_estate.real_estate_price')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		body('real_estate.real_estate_taxation_value')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		body('real_estate.real_estate_size')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		body('real_estate.real_estate_address')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String"),
		body('real_estate.real_estate_city')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String"),
		body('real_estate.real_estate_link')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String"),
		body('real_estate.real_estate_document')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.own_investment_amount')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric"),
		body('real_estate.description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String"),
			// .exists().withMessage("Required Key/Value Pair")
			// .notEmpty().withMessage("Can not be Empty"),
		body('real_estate.additional_details')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),

// bankId input validation
		body('bankid.progressStatus')
			.if(body('bankid').exists())
			.equals('COMPLETE'),
		body('bankid.signature')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty")
			.isString().withMessage("It Should be String"),
		body('bankid.ocspResponse')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty")
			.isString().withMessage("It Should be String"),
		body('bankid.userInfo')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),

		body('bankid.userInfo.givenName')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid.userInfo').exists())
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty")
			.isString().withMessage("It Should be String"),
		body('bankid.userInfo.surname')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid.userInfo').exists())
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty")
			.isString().withMessage("It Should be String"),
	];
}

module.exports = {
	saveAppValidation
}