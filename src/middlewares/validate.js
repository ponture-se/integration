const { body, validationResult } = require('express-validator');
const response = require("../controllers/myResponse");

function validate (req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    let jsonRes = response(false, null, 400, "Input Error.", extractedErrors);
  
    return res.status(400).send(jsonRes);
  }


  module.exports = validate;