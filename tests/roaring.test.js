const nock = require('nock');
const roaringMockResponse = require('../mockResponses/roaringMockResponse');
const roaring = require('../src/controllers/roaring');

var apiRoot = process.env.ROARING_API_ROOT || "https://api.roaring.io";

describe("Roaring Tests", () => {
    // beforeEach(()=>{
    //     nock(apiRoot)
    //     .post('/token')
    //     .reply(200, roaringMockResponse.token);
    // });

    it("getRoaringToken Test - OK", async () => {
        nock(apiRoot)
        .post('/token')
        .reply(200, roaringMockResponse.token);

        response = await roaring.getRoaringToken();
        expect(response.success).toEqual(true);
    });

    it("getRoaringToken Test - unSuccess Status Code", async () => {
        nock(apiRoot)
        .post('/token')
        .reply(500, roaringMockResponse.token);

        response = await roaring.getRoaringToken();
        expect(response.success).toEqual(false);
    });
});