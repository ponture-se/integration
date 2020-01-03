

class salesforceException extends Error {
    constructor(message, errObj) {
        super(message);
        this.name = this.constructor.name;
        // this.metadata = errObj;

        // Set errors detail based on jsForce errorCode
        if (errObj) {
            if (!Array.isArray(errObj)){
                errObj = [errObj];
            }

            switch (errObj[0].errorCode) {
                case 'NOT_FOUND':
                    this.statusCode = 404;
                    break;
            
                default:
                    this.statusCode = 500;
                    break;
            }

        }
    }
}



module.exports = {
    salesforceException
}