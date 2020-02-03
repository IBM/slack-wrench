"use strict";
exports.__esModule = true;
var Fields = /** @class */ (function () {
    function Fields() {
        this.reset();
    }
    Fields.prototype.reset = function () {
        this.token = 'TOKEN';
        this.response_url = 'https://fake.slack/response_url';
        this.trigger_id = 'TRIGGER_ID';
        this.api_app_id = 'API_APP_ID';
        this.callback_id = 'CALLBACK_ID';
        this.user = {
            id: 'UUSERID',
            name: 'USER'
        };
        this.channel = {
            id: 'CCHANNELID',
            name: 'channel'
        };
        this.team = {
            id: 'TTEAMID',
            domain: 'team-domain'
        };
        this.ts = '0000000000.000000';
    };
    return Fields;
}());
exports["default"] = new Fields();
