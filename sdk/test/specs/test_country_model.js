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
describe("Unit tests for country model.", function() {
    it("Test Country Endpoint is correct", function() {
        var country = new BCAPI.Models.Country();
        var expectedEndpoint = "/api/v2/admin/system/countries";
        expect(country.endpoint()).toBe(expectedEndpoint);
    });

    it("Test attribute setter, partial value preserves defaults", function() {
        var country = new BCAPI.Models.Country();
        var attributes = {
            countryCode: "",
            displayName: ""
        }
        country.set(attributes);
        _assertItemValues(country,attributes);
    });

    function _assertItemValues(item, values) {
        expect(item.get("name")).toBe(values.name);
        expect(item.get("parentId")).toBe(values.parentId);
        expect(item.get("publicAccess")).toBe(values.publicAccess);
    }
});
