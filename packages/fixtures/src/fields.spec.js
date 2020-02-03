"use strict";
exports.__esModule = true;
var index_1 = require("./index");
describe('Defaults', function () {
    afterEach(function () {
        index_1.fields.reset();
    });
    it('has all the fields', function () {
        expect.assertions(1);
        expect(index_1.fields).toMatchSnapshot();
    });
    it('allows global overrides', function () {
        expect.assertions(2);
        var overrideToken = 'a-very-different-token';
        var originalToken = index_1.fields.token;
        expect(index_1.events.blockButtonAction()).toEqual(expect.objectContaining({
            token: originalToken
        }));
        index_1.fields.token = overrideToken;
        expect(index_1.events.blockButtonAction()).toEqual(expect.objectContaining({
            token: overrideToken
        }));
    });
    it('Allows resetting overrides', function () {
        expect.assertions(1);
        var originalTs = index_1.fields.ts;
        index_1.fields.ts = "this isn't a real ts";
        index_1.fields.reset();
        expect(index_1.fields.ts).toEqual(originalTs);
    });
});
