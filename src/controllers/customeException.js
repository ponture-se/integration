class salesforceException extends Error {
    constructor(message, errObj, statusCode = null) {
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

        if (statusCode != null) {
            this.statusCode = statusCode;
        }
    }
}


class externalCalloutException extends Error {
    constructor(message, errObj, statusCode = null) {
        super(message);
        this.name = this.constructor.name;
        this.metadata = errObj;

        // // Set errors detail based on jsForce errorCode
        // if (errObj) {
        //     if (!Array.isArray(errObj)){
        //         errObj = [errObj];
        //     }
        // }

        if (statusCode != null) {
            this.statusCode = statusCode;
        } else {
            this.statusCode = 500;
        }
    }
}



class inputValidationException extends Error {
    constructor(message, errObj = null, statusCode = null) {
        super(message);
        this.name = this.constructor.name;
        this.metadata = errObj;


        if (statusCode != null) {
            this.statusCode = statusCode;
        } else {
            this.statusCode = 500;
        }
    }
}



module.exports = {
    salesforceException,
    externalCalloutException,
    inputValidationException
}