const { body } = require('express-validator');


function tokenWithOppIdValidationModel(){
    return [
      body('oppId').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .trim()
                        .notEmpty().withMessage("Can not be Empty")
    ];
  }

  module.exports = {
    tokenWithOppIdValidationModel
  }