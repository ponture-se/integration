const { body } = require('express-validator');


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

  module.exports = {
    loginValidation
  }