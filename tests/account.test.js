const roaringMockResponse = require('../mockResponses/roaringMockResponse');
const accountCtrl = require('../src/controllers/accountController');
const nock = require('nock');
const roaringBaseUrl = process.env.ROARING_LOGIN_API_ROOT || "https://api.roaring.io";

// jest.mock('axios');

describe('Test getLegalFormApiName Method', function(){
    it('Should return values of dict for existing keys (Case-Sensitive Testing)', function(){
        let legalFormCode = 'Handelsbolag';
        expect(accountCtrl.getLegalFormApiName(legalFormCode)).toEqual('Handelsbolag');
    });

    it('Should return values of dict for existing keys (Case-Insensitive Testing)', function(){
        let legalFormCode = 'hanDelSboLAG';
        expect(accountCtrl.getLegalFormApiName(legalFormCode)).toEqual('Handelsbolag');
    });

    it('Should return null for non-existing keys', function(){
        let legalFormCode = 'Random Key';
        expect(accountCtrl.getLegalFormApiName(legalFormCode)).toBeNull();
    });
});



describe('Test getAccountFromExternalService Method', function(){
    const orgNumber = "5565002465";
    const orgName = "Wilfast Högsbo Aktiebolag";

    beforeEach(() => {
        nock(roaringBaseUrl)
        .post('/token')
        .reply(200, roaringMockResponse.token)
        .get('/se/company/overview/1.1/' + orgNumber)
        .reply(200, roaringMockResponse.overview)
        .get('/se/company/economy-overview/1.1/' + orgNumber)
        .reply(200, roaringMockResponse.ecoOverview)
        .get('/se/company/board-members/1.1/' + orgNumber)
        .reply(200, roaringMockResponse.boardMembers)
        .get('/se/beneficialowner/1.0/company/' + orgNumber)
        .reply(200, roaringMockResponse.beneficialOwners)
        .get('/se/company/signatory/1.1/' + orgNumber)
        .reply(200, roaringMockResponse.signatory)
        .get("/global/sanctions-lists/1.0/search")
        .query({name: orgName})
        .reply(200, roaringMockResponse.cmpSanctionInfo);

    });
    
    it('Should has all Objects for a valid orgNumber in Roaring sandbox env', done => {
        accountCtrl.getAccountFromExternalService(orgNumber,orgName, (errors, results) => {
            try{
                expect(results).toHaveProperty('overview');
                expect(results).toHaveProperty('ecoOverview');
                expect(results).toHaveProperty('beneficialOwners');
                expect(results).toHaveProperty('signatory');
                expect(results).toHaveProperty('cmpSanctionInfo');
                done();
            } catch(e){
                done.fail(e);
            }
        });

    });
});