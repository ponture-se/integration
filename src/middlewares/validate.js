const { body, validationResult } = require('express-validator');
const response = require("../controllers/myResponse");
const apiLogger = require("./apiLogger");

function validate (req, res, next) {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

    let jsonRes = response(false, null, 400, "Input Error.", extractedErrors);
  
    res.status(400).send(jsonRes);
    res.body = jsonRes;
    apiLogger(req, res, () => {return;});
  }


  module.exports = validate;