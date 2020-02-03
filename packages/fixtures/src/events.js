"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fields_1 = __importDefault(require("./fields"));
exports.message = function (text, options) {
    if (options === void 0) { options = {}; }
    var user = fields_1["default"].user, channel = fields_1["default"].channel, ts = fields_1["default"].ts;
    return __assign({ type: 'message', text: text,
        ts: ts, channel: channel.id, user: user.id }, options);
};
exports.slashCommand = function (command, options) {
    if (options === void 0) { options = {}; }
    var token = fields_1["default"].token, response_url = fields_1["default"].response_url, trigger_id = fields_1["default"].trigger_id, team = fields_1["default"].team, user = fields_1["default"].user, channel = fields_1["default"].channel;
    return __assign({ command: command, text: '', token: token,
        response_url: response_url,
        trigger_id: trigger_id, user_id: user.id, user_name: user.name, team_id: team.id, team_domain: team.domain, channel_id: channel.id, channel_name: channel.name }, options);
};
// Helper function to create more specific Block Actions
function blockAction(action, options) {
    if (options === void 0) { options = {}; }
    var token = fields_1["default"].token, response_url = fields_1["default"].response_url, trigger_id = fields_1["default"].trigger_id, api_app_id = fields_1["default"].api_app_id, team = fields_1["default"].team, user = fields_1["default"].user, channel = fields_1["default"].channel;
    return __assign({ type: 'block_actions', actions: [action], team: team,
        user: user,
        channel: channel,
        token: token,
        response_url: response_url,
        trigger_id: trigger_id,
        api_app_id: api_app_id, container: {} }, options);
}
function blockButtonAction(action, options) {
    return blockAction(__assign({ type: 'button', action_ts: 'ACTION_TS', text: {
            type: 'plain_text',
            text: 'TEXT'
        }, action_id: 'ACTION_ID', block_id: 'BLOCK_ID', value: 'VALUE' }, action), options);
}
exports.blockButtonAction = blockButtonAction;
