const expect = require('chai').expect;
const accountCtrl = require('../src/controllers/accountController');

describe('Test Account Controller', function(){
    describe('Test getLegalFormApiName Method', function(){
        it('Should return values of dict for existing keys (Case-Sensitive Testing)', function(){
            let legalFormCode = 'Handelsbolag';
            expect(accountCtrl.getLegalFormApiName(legalFormCode)).to.equal('Handelsbolag');
        });

        it('Should return values of dict for existing keys (Case-Insensitive Testing)', function(){
            let legalFormCode = 'hanDelSboLAG';
            expect(accountCtrl.getLegalFormApiName(legalFormCode)).to.equal('Handelsbolag');
        });

        it('Should return null for non-existing keys', function(){
            let legalFormCode = 'Random Key';
            expect(accountCtrl.getLegalFormApiName(legalFormCode)).to.equal(null);
        });
    });
});