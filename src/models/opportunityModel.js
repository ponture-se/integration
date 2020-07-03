const {
	body,
	oneOf,
	query
} = require('express-validator');
const _ = require('lodash');
const myResponse = require('../controllers/myResponse');
const apiLogger = require('../middlewares/apiLogger');


function saveAppValidation() {
	return [
		oneOf([
			[
				body('orgNumber').isNumeric().withMessage('It Should be Numeric')
					.exists().withMessage("Required Key/Value Pair")
					.notEmpty().withMessage("Can not be Empty")
					.matches(/^([0-9]){6}-?([0-9]){4}$/).withMessage('Invalid Pattern'),
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
			.notEmpty().withMessage("Can not be Empty")
			.matches(/^([0-9]*[-]?)[0-9]*$/).withMessage('Invalid Pattern'),
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
		body('phoneNumber').isString().withMessage("Value Must be String.")
			// .matches(/^(\+?46|0|0046)[\s\-]?[1-9][\s\-]?[0-9]([\s\-]?\d){6,7}$/).withMessage('Invalid Pattern.')
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
		body('utm_source').isString().withMessage('It Should be String').optional(),
		body('utm_medium').isString().withMessage('It Should be String').optional(),
		body('utm_campaign').isString().withMessage('It Should be String').optional(),
		body('referral_id').isString().withMessage('It Should be String').optional(),
		body('last_referral_date').isString().withMessage('It Should be String').optional(),

		body('acquisition.object_name')
			.if(body('acquisition').exists())
			.isString().withMessage('It Should be String')
			.optional(),
		body('acquisition.object_company_name')
			.if(body('acquisition').exists())
			.isString().withMessage('It Should be String')
			.optional(),
		body('acquisition.object_organization_number')
			.if(body('acquisition').exists())
			.isNumeric().withMessage('It Should be Numeric')
			.matches(/^([0-9]){6}-?([0-9]){4}$/).withMessage('Invalid Pattern')
			.optional({ checkFalsy: true }),
		body('acquisition.object_price')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		body('acquisition.object_industry')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.object_annual_report')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String"),
		body('acquisition.object_balance_sheet')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.object_income_statement')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.object_valuation_letter')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.account_balance_sheet')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.account_income_statement')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.available_guarantees')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.available_guarantees_description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.purchaser_profile')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.own_investment_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.additional_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.purchase_type')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.additional_files')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array")
			.optional(),
		body('acquisition.business_plan')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array")
			.optional(),
		body('acquisition.own_investment_amount')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		
		body('real_estate.real_estate_type')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_usage_category')
			.if(body('real_estate').exists())
			.isArray().withMessage("Value Must be Array")
			.optional(),
		body('real_estate.real_estate_price')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		body('real_estate.real_estate_taxation_value')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		body('real_estate.real_estate_size')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		body('real_estate.real_estate_address')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_city')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_link')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_document')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.own_investment_amount')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.optional(),
		body('real_estate.description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
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


function submitValidation() {
	return [
		oneOf([
			[
				body('orgNumber').isNumeric().withMessage('It Should be Numeric')
					.exists().withMessage("Required Key/Value Pair")
					.trim()
					.notEmpty().withMessage("Can not be Empty")
					.matches(/^([0-9]){6}-?([0-9]){4}$/).withMessage('Invalid Pattern'),
				body('orgName').isString().withMessage('It Should be String')
					.exists().withMessage("Required Key/Value Pair")
					.trim()
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
			.trim()
			.notEmpty().withMessage("Can not be Empty")
			.matches(/^([0-9]*[-]?)[0-9]*$/).withMessage('Invalid Pattern'),
		body('amount').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty"),
		body('amourtizationPeriod').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty"),
		// body('lastName').isString().withMessage('It Should be String')
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty"),
		// body('firstName').isString().withMessage('It Should be String').optional(),
		body('givenRevenue').isNumeric().withMessage('It Should be Numeric').optional(),
		body('email').exists().withMessage("Required Key/Value Pair")
					.trim()
					.notEmpty().withMessage("Can not be Empty")
					.isEmail().withMessage('It Should be an Email'),
		body('phoneNumber').isString().withMessage("Value Must be String.")
			// .matches(/^(\+?46|0|0046)[\s\-]?[1-9][\s\-]?[0-9]([\s\-]?\d){6,7}$/).withMessage('Invalid Pattern.')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('need').exists().withMessage("Required Key/Value Pair")
			.isLength({
				min: 1
			}).withMessage("At least one value should exist")
			.isArray().withMessage("Value Must be Array"),
		body('needDescription').isString().withMessage('It Should be String').optional(),
		body('oppId').isString().withMessage('It Should be String').optional(),
		// body('broker_id').isString().withMessage('It Should be String')
		// 	.notEmpty().withMessage("Can not be Empty")
		// 	.optional(),
		body('utm_source').isString().withMessage('It Should be String').optional(),
		body('utm_medium').isString().withMessage('It Should be String').optional(),
		body('utm_campaign').isString().withMessage('It Should be String').optional(),
		body('referral_id').isString().withMessage('It Should be String').optional(),
		body('last_referral_date').isString().withMessage('It Should be String').optional(),

		body('acquisition.object_name')
			.if(body('acquisition').exists())
			.isString().withMessage('It Should be String')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_company_name')
			.if(body('acquisition').exists())
			.isString().withMessage('It Should be String')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_organization_number')
			.if(body('acquisition').exists())
			.isNumeric().withMessage('It Should be Numeric')
			.matches(/^([0-9]){6}-?([0-9]){4}$/).withMessage('Invalid Pattern')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_price')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_industry')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_annual_report')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_balance_sheet')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_income_statement')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.object_valuation_letter')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		// if the company is not real (User does'nt have company befor, so no orgNumber provided (just for acquisition)), this field will be optional
		body('acquisition.account_balance_sheet')
			.if(body('acquisition').exists())
			.if(body('orgNumber').notEmpty())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		// if the company is not real (User does'nt have company befor, so no orgNumber provided (just for acquisition)), this field will be optional
		body('acquisition.account_income_statement')
			.if(body('acquisition').exists())
			.if(body('orgNumber').notEmpty())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.available_guarantees')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.available_guarantees_description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.purchaser_profile')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.own_investment_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.additional_details')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('acquisition.purchase_type')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.description')
			.if(body('acquisition').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.additional_files')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array")
			.optional(),
		body('acquisition.business_plan')
			.if(body('acquisition').exists())
			.isArray().withMessage("Value Must be Array")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('acquisition.own_investment_amount')
			.if(body('acquisition').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		
		body('real_estate.real_estate_type')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_usage_category')
			.if(body('real_estate').exists())
			.isArray().withMessage("Value Must be Array")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_price')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_taxation_value')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_size')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_address')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_city')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_link')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.real_estate_description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.real_estate_document')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),
		body('real_estate.own_investment_amount')
			.if(body('real_estate').exists())
			.isNumeric().withMessage("It Should be Numeric")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.description')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('real_estate.additional_details')
			.if(body('real_estate').exists())
			.isString().withMessage("It Should be String")
			.optional(),

// bankId input validation
		// body('bankid.progressStatus')
		// 	.if(body('bankid').exists())
		// 	.equals('COMPLETE'),
		// body('bankid.signature')
		// 	.if(body('bankid.progressStatus').equals('COMPLETE'))
		// 	.if(body('bankid').exists())
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty")
		// 	.isString().withMessage("It Should be String"),
		// body('bankid.ocspResponse')
		// 	.if(body('bankid.progressStatus').equals('COMPLETE'))
		// 	.if(body('bankid').exists())
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty")
		// 	.isString().withMessage("It Should be String"),
		// body('bankid.userInfo')
		// 	.if(body('bankid.progressStatus').equals('COMPLETE'))
		// 	.if(body('bankid').exists())
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty")

		// body('bankid.userInfo.givenName')
		// 	.if(body('bankid.progressStatus').equals('COMPLETE'))
		// 	.if(body('bankid.userInfo').exists())
		// 	.if(body('bankid').exists())
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty")
		// 	.isString().withMessage("It Should be String"),
		// body('bankid.userInfo.surname')
		// 	.if(body('bankid.progressStatus').equals('COMPLETE'))
		// 	.if(body('bankid.userInfo').exists())
		// 	.if(body('bankid').exists())
		// 	.exists().withMessage("Required Key/Value Pair")
		// 	.notEmpty().withMessage("Can not be Empty")
		// 	.isString().withMessage("It Should be String"),
	];
}

function offersOfLatestOppValidation() {
	return [
		query('personalNum').isNumeric().withMessage('It Should be Numeric')
							.exists().withMessage("Required Key/Value Pair")
							.notEmpty().withMessage("Can not be Empty")
							.matches(/^([0-9]*[-]?)[0-9]*$/).withMessage('Invalid Pattern')
	];
}

function offersOfLatestOppV2Validation() {
	return [
		query('personalNum').isNumeric().withMessage('It Should be Numeric')
							.exists().withMessage("Required Key/Value Pair")
							.notEmpty().withMessage("Can not be Empty")
							.matches(/^([0-9]*[-]?)[0-9]*$/).withMessage('Invalid Pattern'),
		query('orgNumber').isString().withMessage("It Should be String")
						.exists().withMessage("Required Key/Value Pair")
						.notEmpty().withMessage("Can not be Empty")
	];
}


function acceptOfferValidation() {
	return [
		query('offerId').isString().withMessage("It Should be String")
						.exists().withMessage("Required Key/Value Pair")
						.trim()
						.notEmpty().withMessage("Can not be Empty"),
		query('email').optional()
						.trim()
						.notEmpty().withMessage("Can not be Empty")
						.isEmail().withMessage('It Should be an Email'),
						
		query('phoneNumber').isString().withMessage("Value Must be Numeric.")
							// .exists().withMessage("Required Key/Value Pair")
							.optional()
							.trim()
							.notEmpty().withMessage("Can not be Empty")
							// .matches(/^(\+?46|0|0046)[\s\-]?[1-9][\s\-]?[0-9]([\s\-]?\d){6,7}$/).withMessage('Invalid Pattern.')
	];
}




function submitV2Validation() {
	return [
		body('oppId').isString().withMessage('It Should be String')
					.exists().withMessage("Required Key/Value Pair")
					.trim()
					.notEmpty().withMessage("Can not be Empty"),
		body('orgNumber').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty")
			.matches(/^([0-9]){6}-?([0-9]){4}$/).withMessage('Invalid Pattern'),
		body('orgName').isString().withMessage('It Should be String')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty"),
		body('personalNumber').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty")
			.matches(/^([0-9]*[-]?)[0-9]*$/).withMessage('Invalid Pattern'),
		body('amount').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty"),
		body('amourtizationPeriod').isNumeric().withMessage('It Should be Numeric')
			.exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty"),
		body('email').exists().withMessage("Required Key/Value Pair")
			.trim()
			.notEmpty().withMessage("Can not be Empty")
			.isEmail().withMessage('It Should be an Email'),
		body('phoneNumber').isString().withMessage("Value Must be String.")
			// .matches(/^(\+?46|0|0046)[\s\-]?[1-9][\s\-]?[0-9]([\s\-]?\d){6,7}$/).withMessage('Invalid Pattern.')
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty"),
		body('need').exists().withMessage("Required Key/Value Pair")
			.isLength({
				min: 1
			}).withMessage("At least one value should exist")
			.isArray().withMessage("Value Must be Array"),
		body('needDescription').isString().withMessage('It Should be String').optional(),
		body('givenRevenue').isNumeric().withMessage('It Should be Numeric').optional(),
		body('utm_source').isString().withMessage('It Should be String').optional(),
		body('utm_medium').isString().withMessage('It Should be String').optional(),
		body('utm_campaign').isString().withMessage('It Should be String').optional(),
		body('referral_id').isString().withMessage('It Should be String').optional(),
		body('last_referral_date').isString().withMessage('It Should be String').optional(),
		// bankId input validation
		body('bankid')
			.exists().withMessage('Required Key/Value Pair')
			.notEmpty().withMessage("Can not be Empty"),
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
		body('bankid.userInfo.name')
			.if(body('bankid.progressStatus').equals('COMPLETE'))
			.if(body('bankid.userInfo').exists())
			.if(body('bankid').exists())
			.exists().withMessage("Required Key/Value Pair")
			.notEmpty().withMessage("Can not be Empty")
			.isString().withMessage("It Should be String"),
	];
}


function createOppValidation(req, res, next) {
	let orgNumberPattern =  /^([0-9]){6}-?([0-9]){4}$/,
		personalNumPattern = /^([0-9]*[-]?)[0-9]*$/,
		emailPattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

	let orgNumber = _.get(req, 'body.orgNumber'),
		orgName = _.get(req, 'body.orgName'),
		personalNumber = _.get(req, 'body.personalNumber'),
		amount = parseFloat(_.get(req, 'body.amount')),
		amourtizationPeriod = parseInt(_.get(req, 'body.amourtizationPeriod')),
		email = _.get(req, 'body.email'),
		phoneNumber = _.get(req, 'body.phoneNumber'),
		need = _.get(req, 'body.need'),
		needDescription = _.get(req, 'body.needDescription'),
		givenRevenue = parseFloat(_.get(req, 'body.givenRevenue')),
		utm_source = _.get(req, 'body.utm_source'),
		utm_medium = _.get(req, 'body.utm_medium'),
		utm_campaign = _.get(req, 'body.utm_campaign'),
		referral_id = _.get(req, 'body.referral_id'),
		last_referral_date = _.get(req, 'body.last_referral_date');

	let resBody = myResponse(false, null, 400, null, null, null);

	if (orgNumber == null || (typeof orgNumber == 'string' && orgNumber.trim() == '')) {
		resBody.errorCode = 'EMPTY_ORGNUM';
	} else if (orgNumber.trim().match(orgNumberPattern) == null) {
		resBody.errorCode = 'INVALID_ORGNUM';
	} else if (personalNumber == null || (typeof personalNumber == 'string' && personalNumber.trim() == '')) {
		resBody.errorCode = 'EMPTY_PERNUM';
	} else if (personalNumber.trim().match(personalNumPattern) == null) {
		resBody.errorCode = 'INVALID_PERNUM';
	} else if (orgName == null || (typeof orgName == 'string' && orgName.trim() == '')) {
		resBody.errorCode = 'EMPTY_ORGNAME';
	} else if (!amount || (amount && amount < 0)) {
		resBody.errorCode = 'INVALID_AMOUNT';
	} else if (!amourtizationPeriod || (amourtizationPeriod && amourtizationPeriod <0)) {
		resBody.errorCode = 'INVALID_PERIOD';
	} else if (email == null || (typeof email == 'string' && email.trim().match(emailPattern) == null)) {
		resBody.errorCode = 'INVALID_EMAIL';
	} else if (phoneNumber == null || (typeof phoneNumber == 'string' && phoneNumber.trim() == '')) {
		resBody.errorCode = 'INVALID_PHONE';
	} else if (!Array.isArray(need) || need.length < 1) {
		resBody.errorCode = 'INVALID_NEED';
	} else if (givenRevenue && givenRevenue <0) {
		resBody.errorCode = 'INVALID_REVENUE';
	} else if (needDescription && typeof needDescription != 'string') {
		resBody.errorCode = 'INVALID_NEED_DESC';
	} else if (utm_source && typeof utm_source != 'string') {
		resBody.errorCode = 'INVALID_UTM_SRC';
	} else if (utm_medium && typeof utm_medium != 'string') {
		resBody.errorCode = 'INVALID_UTM_MED';
	} else if (utm_campaign && typeof utm_campaign != 'string') {
		resBody.errorCode = 'INVALID_UTM_CAMP';
	} else if (referral_id && typeof referral_id != 'string') {
		resBody.errorCode = 'INVALID_REF_ID';
	} else if (last_referral_date && typeof last_referral_date != 'string') {
		resBody.errorCode = 'INVALID_REF_DATE';
	}
	
	if (resBody.errorCode != null) {
		res.status(400).send(resBody);
		res.body = resBody;
		return apiLogger(req, res, () => {return;});			//instead of calling next()
	} else {
		return next();
	}
}

module.exports = {
	saveAppValidation,
	submitValidation,
	offersOfLatestOppValidation,
	offersOfLatestOppV2Validation,
	acceptOfferValidation,
	createOppValidation,
	submitV2Validation
}