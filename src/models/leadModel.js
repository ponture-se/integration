// const Joi = require('joi');
const { body } = require('express-validator');

// function validateLead(lead){
//     // const schema = {
//     //     companyName: Joi.string().required(),
//     //     orgNumber: Joi.string().min(5).required(),
//     //     firstName: Joi.string().required(),
//     //     lastName: Joi.string().required(),
//     //     phone: Joi.string().required(),
//     //     email: Joi.string().required().email(),
//     //     // interest: Joi.object().required(),
//     //     interest: Joi.array().min(1).required(),
//     //     description: Joi.string().required(),
//     //   };
//     const schema = Joi.object().keys(
//       {
//         companyName: Joi.string().required(),
//         orgNumber: Joi.string().min(5).required(),
//         firstName: Joi.string().required(),
//         lastName: Joi.string().required(),
//         phone: Joi.string().required(),
//         email: Joi.string().required().email(),
//         // interest: Joi.object().required(),
//         interest: Joi.array().min(1).required(),
//         description: Joi.string().required(),
//         utm_source: Joi.string(),
//         utm_medium: Joi.string(),
//         utm_campaign: Joi.string(),
//         referral_id: Joi.string(),
//         last_referral_date: Joi.date(),
//       }
//     ).pattern(/./, Joi.any());
    
//       return Joi.validate(lead, schema);
// }


function leadValidationRules() {
  return [
    body('organization_number').isNumeric().withMessage("Value Must be Numeric.")
                              .exists().withMessage("Required Key/Value Pair")
                              .notEmpty().withMessage("Can not be Empty"),
    body('phone').isNumeric().withMessage("Value Must be Numeric.").optional(),
    body('email').isEmail().withMessage("Value Must be Email.").optional(),
    body('situation').isString().withMessage("Value Must be String.")
                    .exists().withMessage("Required Key/Value Pair"),
    body('lead_revenue').isNumeric().withMessage("Value Must be Numeric.").optional(),
    body('lead_company').isString().withMessage("Value Must be String.").optional(),
    body('last_name').isString().withMessage("Value Must be String.")
                    .exists().withMessage("Required Key/Value Pair")
                    .notEmpty().withMessage("Can not be Empty"),
    body('first_name').isString().withMessage("Value Must be String.").optional(),
    body('mobile').isMobilePhone().withMessage("Value Must be Mobilephone.").optional(),
    body('problem').isArray().withMessage("Value Must be Array")
                            .isLength({ min: 1 }).withMessage("At least one value should exist")
                            .exists().withMessage("Required Key/Value Pair"),
    body('need_payoff').isArray().withMessage("Value Must be Array").optional(),
    body('need_description').isString().withMessage("Value Must be String.").optional(),
    body('spin_stage').isString().withMessage("Value Must be String.").optional(),
    body('marketing_email_opt_out').isBoolean().withMessage("Value Must be Boolean").optional(),
    body('sales_email_opt_out').isBoolean().withMessage("Value Must be Boolean").optional(),
    body('lead_status').isString().withMessage("Value Must be String.").optional(),
    body('utm_source').isString().withMessage("Value Must be String.").optional(),
    body('utm_medium').isString().withMessage("Value Must be String.").optional(),
    body('utm_campaign').isString().withMessage("Value Must be String.").optional(),
    body('referral_id').isString().withMessage("Value Must be String.").optional(),
    body('last_referral_date').isString().withMessage("Value Must be String").optional(),
    body('lead_source').isString().withMessage("Value Must be String").optional(),
    body('lead_action').isString().withMessage("Value Must be String.").optional(),
    body('specific_lead_source').isURL().withMessage("Value Must be URL").optional()
  ];
}





module.exports = leadValidationRules;