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
    body('companyName').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('orgNumber').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('firstName').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('lastName').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('phone').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('email').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('interest').isArray().withMessage("Value Must be Array").isLength({ min: 1 }).withMessage("At least one value should exist").exists().withMessage("Required Key/Value Pair"),
    body('description').isString().withMessage("Value Must be String.").exists().withMessage("Required Key/Value Pair"),
    body('utm_source').isString().withMessage("Value Must be String."),
    body('utm_medium').isString().withMessage("Value Must be String."),
    body('utm_campaign').isString().withMessage("Value Must be String."),
    body('referral_id').isString().withMessage("Value Must be String."),
    body('last_referral_date')
  ];
}





module.exports = leadValidationRules;