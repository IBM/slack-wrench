"use strict";
exports.__esModule = true;
var index_1 = require("./index");
describe('Events fixtures', function () {
    var user_id = 'UPINKIE';
    var command = '/command';
    var text = 'Rainbow is 20% cooler';
    it('slashCommand Events return an object', function () {
        expect.assertions(1);
        // Not including more in depth tests as typing should serve that purpose
        expect(index_1.events.slashCommand(command)).toEqual(expect.objectContaining({ command: command }));
    });
    it('can override slashCommand fields', function () {
        expect.assertions(1);
        var options = { user_id: user_id };
        expect(index_1.events.slashCommand(command, options)).toEqual(expect.objectContaining(options));
    });
    it('generates block button action Events', function () {
        expect.assertions(1);
        var action_id = 'button';
        var event = index_1.events.blockButtonAction({ action_id: action_id });
        // Not including more in depth tests as typing should serve that purpose
        expect(event.actions[0].action_id).toEqual(action_id);
    });
    it('can override block action fields', function () {
        expect.assertions(1);
        var options = {
            user: {
                id: user_id,
                name: 'Pinkie'
            }
        };
        expect(index_1.events.blockButtonAction({}, options)).toEqual(expect.objectContaining(options));
    });
    it('generates a message block', function () {
        expect.assertions(1);
        // Not including more in depth tests as typing should serve that purpose
        expect(index_1.events.message(text)).toEqual(expect.objectContaining({ text: text }));
    });
    it('can override message fields', function () {
        expect.assertions(1);
        var options = { user: user_id };
        expect(index_1.events.message(text, options)).toEqual(expect.objectContaining(options));
    });
});
