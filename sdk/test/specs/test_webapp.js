/* 
* 
* Copyright © 2016 Adobe. All rights reserved.

* Permission is hereby granted, free of charge, to any person obtaining a
* copy of this software and associated documentation files (the "Software"), 
* to deal in the Software without restriction, including without limitation 
* the rights to use, copy, modify, merge, publish, distribute, sublicense, 
* and/or sell copies of the Software, and to permit persons to whom the 
* Software is furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in
* all copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
* DEALINGS IN THE SOFTWARE.
* 
*/
describe("BCAPI.Models.WebApp.App", function() {
    var webApp,
        rootUrl = '',
        siteToken = 'none',
        collectionUrl = rootUrl + '/api/v2/admin/sites/current/webapps',
        itemUrl = collectionUrl + '/SampleApp';

    beforeEach(function() {
        BCAPI.Mocks.Helper.Site(siteToken, rootUrl);

        webApp = new BCAPI.Models.WebApp.App({"name" : "SampleApp"});
    });

    it('url()', function() {
        expect(webApp.url()).toBe(collectionUrl);

        webApp.isNotNew = true;
        expect(webApp.url()).toBe(itemUrl);
    });

    it('uses correct urls in fetch, even if id attribute is not set', function() {
        spyOn($ ,"ajax").andCallFake(function(options) {
            expect(options.url).toBe(itemUrl);
            
            return $.Deferred();
        });

        webApp.fetch();
    });

    it('uses correct urls in destroy, even if id attribute is not set', function() {
        spyOn($ ,"ajax").andCallFake(function(options) {
            expect(options.url).toBe(itemUrl);
            
            return $.Deferred();
        });

        webApp.destroy();
    });
});
