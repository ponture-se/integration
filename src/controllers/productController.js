const _ = require('lodash');

function setTagForOffersList(offerList) {

    // sort by date, to tag equal values based on eralier createdDate
    offerList = _.sortBy(offerList, ['CreatedDate'], ['asc']);

    // Tag Lists
    offerList = tag_addCheapestTagForOffersList(offerList);
    offerList = tag_addBiggestTagForOffersList(offerList);

    // convert list to comma-seperated
    offerList.forEach(o => {
        let tag = _.get(o, 'tag', []);

        o.tag = tag.join(',');
    });

    // resort offerList to show in descending order by CreatedDate
    offerList = _.sortBy(offerList, ['CreatedDate'], ['desc']);

    return offerList;

}

function tag_addCheapestTagForOffersList(offerList) {
    let cheapestOfferValue = Infinity,
        cheapestOfferId = '';

    // calculate to find value
    offerList.forEach(o => {
        let monthlyRepayment = _.get(o, 'detail.Monthly_Repayment');

        if (monthlyRepayment){
            if (monthlyRepayment < cheapestOfferValue) {
                cheapestOfferValue = monthlyRepayment;
                cheapestOfferId = _.get(o, 'Id', '__');
            }
        }
    });

    // Set tag Fields
    offerList.forEach(o => {
        let tag = _.get(o, 'tag', []);
        
        let offerId = _.get(o, 'Id');
        if (offerId && offerId == cheapestOfferId) {
            tag.push('cheapest');
        }

        o.tag = tag;
    });

    return offerList;
}

function tag_addBiggestTagForOffersList(offerList) {
    let biggestAmountOfferValue = -Infinity,
        biggestPeriodOfferValue = -Infinity,
        biggestOfferId = '';

    // calculate to find value
    offerList.forEach(o => {
        let amount = _.get(o, 'Amount');
        let period = _.get(o, 'Loan_Period');

        if (amount){
            if (amount > biggestAmountOfferValue) {
                biggestAmountOfferValue = amount;
                biggestPeriodOfferValue = period;
                biggestOfferId = _.get(o, 'Id', '__');
            } else if (amount == biggestAmountOfferValue && period > biggestPeriodOfferValue) {
                biggestAmountOfferValue = amount;
                biggestPeriodOfferValue = period;
                biggestOfferId = _.get(o, 'Id', '__');
            }
        }
    });

    // Set tag Fields
    offerList.forEach(o => {
        let tag = _.get(o, 'tag', []);
        
        let offerId = _.get(o, 'Id');
        if (offerId && offerId == biggestOfferId) {
            tag.push('biggest');
        }

        o.tag = tag;
    });

    return offerList;
}


module.exports = {
    setTagForOffersList
}