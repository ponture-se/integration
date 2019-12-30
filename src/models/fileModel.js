const { body } = require('express-validator');


function fileUploadValidation(){
    return [
      body('title').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .notEmpty().withMessage("Can not be Empty"),
    body('fileExtension').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .notEmpty().withMessage("Can not be Empty"),
    body('content').isString().withMessage('It Should be String')
                        .exists().withMessage("Required Key/Value Pair")
                        .notEmpty().withMessage("Can not be Empty")
    ];
  }

  module.exports = {
    fileUploadValidation
  }