"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var delay_1 = __importDefault(require("delay"));
var fs_extra_1 = __importDefault(require("fs-extra"));
var path_1 = __importDefault(require("path"));
var shortid_1 = __importDefault(require("shortid"));
var index_1 = __importDefault(require("./index"));
describe('FileStore', function () {
    var defaultDbPath = path_1["default"].join(process.cwd(), ".db");
    var id = 'CONVERSATION_ID';
    var dbPath;
    var store;
    var initialState;
    beforeEach(function () {
        // level-db doesn't work when being quickly recreated in the same dir
        dbPath = path_1["default"].join(__dirname, ".db-" + shortid_1["default"].generate());
        store = new index_1["default"](dbPath);
        initialState = { rainbowDashIs20PercentCooler: true };
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs_extra_1["default"].remove(dbPath)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, fs_extra_1["default"].remove(defaultDbPath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    it('creates a db at a default location', function () { return __awaiter(void 0, void 0, void 0, function () {
        var defaultStore, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    expect.assertions(1);
                    defaultStore = new index_1["default"]();
                    // Setting something to ensure the db is created on disk
                    return [4 /*yield*/, defaultStore.set(id, initialState)];
                case 1:
                    // Setting something to ensure the db is created on disk
                    _b.sent();
                    _a = expect;
                    return [4 /*yield*/, fs_extra_1["default"].pathExists(defaultDbPath)];
                case 2:
                    _a.apply(void 0, [_b.sent()]).toEqual(true);
                    return [2 /*return*/];
            }
        });
    }); });
    // Reference tests rewritten for jest:
    // https://github.com/slackapi/bolt/blob/d59319c550804426d257009128d13312889c4d21/src/conversation-store.spec.ts#L115
    describe('tests from default bolt store', function () {
        it('should store conversation state', function () { return __awaiter(void 0, void 0, void 0, function () {
            var actualConversationState;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expect.assertions(1);
                        return [4 /*yield*/, store.set(id, initialState)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, store.get(id)];
                    case 2:
                        actualConversationState = _a.sent();
                        expect(actualConversationState).toEqual(initialState);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject lookup of conversation state when the conversation is not stored', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expect.assertions(1);
                        return [4 /*yield*/, expect(store.get(id)).rejects.toThrowError("Key not found in database [" + id + "]")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should reject lookup of conversation state when the conversation is expired', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expiresInMs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expect.assertions(1);
                        expiresInMs = 5;
                        return [4 /*yield*/, store.set(id, initialState, Date.now() + expiresInMs)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, delay_1["default"](expiresInMs * 2)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, expect(store.get(id)).rejects.toThrowError('Conversation expired')];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
