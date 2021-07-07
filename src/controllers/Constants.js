module.exports = {
    MIN_AMOUNT_FOR_BANKID_BYPASS: 1999999,
    MIN_AMOUNT_FOR_NON_GENERAL_NEED_TO_BANKID_BYPASS: 999999,
    MIN_AMOUNT_FOR_AB_COMPANY_TO_BANKID_BYPASS: 999999,
    MIN_TURNOVER_FOR_AB_COMPANY_TO_BANKID_BYPASS: 20000000,
    OPP_STAGE_OF_OPP_CREATION_WITH_BANK_ID_NEEDED: 'created',
    OPP_STAGE_OF_OPP_CREATION_WITH_NO_BANK_ID_NEEDED: 'app review',
    INVALID_OPP_STAGE_FOR_BANKID_CHECKING : [
        'submitted',
        'offer received',
        'offer accepted',
        'funded/closed won',
        'not funded/ closed lost'
    ],
    NON_GENERAL_LIQUIDITY_NEEDS: [
        'purchase_of_real_estate',
        'construction_project',
        'loan_on_real_estate',
        'purchase_of_business'
    ]
}