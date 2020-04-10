const _ = require('lodash');

function setTagForOffersList(offerList) {
    let cheepestOfferValue = Infinity,
        cheepestOfferId = '',
        mostExpensiveOfferValue = -Infinity,
        mostExpensiveOfferId = '';

    // calculate to find value
    offerList.forEach(o => {
        let rate = _.get(o, 'Amount', 0) / _.get(o, 'Loan_Period', 1);

        if (rate > mostExpensiveOfferValue) {
            mostExpensiveOfferValue = rate;
            mostExpensiveOfferId = _.get(o, 'Id', '__');
        }

        if (rate < cheepestOfferValue) {
            cheepestOfferValue = rate;
            cheepestOfferId = _.get(o, 'Id', '__');
        }
    });

    // Set tag Fields
    offerList.forEach(o => {
        let tag = [];
        
        let offerId = _.get(o, 'Id');
        if (offerId && offerId == cheepestOfferId) {
            tag.push('cheepest');
        }
        if (offerId == mostExpensiveOfferId) {
            tag.push('biggest');
        }

        o.tag = tag.join(',');
    });

    return offerList;

}


module.exports = {
    setTagForOffersList
}