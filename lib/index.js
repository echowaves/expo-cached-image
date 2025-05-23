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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as FileSystem from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import * as CONST from "./consts";
var CachedImage = function (props) {
    var source = props.source, cacheKey = props.cacheKey, placeholderContent = props.placeholderContent, rest = __rest(props, ["source", "cacheKey", "placeholderContent"]);
    var uri = source.uri, headers = source.headers, expiresIn = source.expiresIn;
    var sanitizedKey = CONST.sanitizeCacheKey(cacheKey);
    var fileURI = "".concat(CONST.IMAGE_CACHE_FOLDER).concat(sanitizedKey, ".png");
    var _a = useState(fileURI), imgUri = _a[0], setImgUri = _a[1];
    var componentIsMounted = useRef(false);
    var requestOption = headers ? { headers: headers } : undefined;
    useEffect(function () {
        componentIsMounted.current = true;
        void loadImageAsync();
        return function () {
            componentIsMounted.current = false;
        };
    }, []);
    var loadImageAsync = function () { return __awaiter(void 0, void 0, void 0, function () {
        var metadata, expired, response, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, FileSystem.getInfoAsync(fileURI)];
                case 1:
                    metadata = _a.sent();
                    expired = Boolean((metadata === null || metadata === void 0 ? void 0 : metadata.exists) &&
                        expiresIn &&
                        new Date().getTime() / 1000 - metadata.modificationTime > expiresIn);
                    if (!(!(metadata === null || metadata === void 0 ? void 0 : metadata.exists) || (metadata === null || metadata === void 0 ? void 0 : metadata.size) === 0 || expired)) return [3 /*break*/, 6];
                    return [4 /*yield*/, setImgUri(null)];
                case 2:
                    _a.sent();
                    if (!componentIsMounted.current) return [3 /*break*/, 6];
                    if (!expired) return [3 /*break*/, 4];
                    return [4 /*yield*/, FileSystem.deleteAsync(fileURI, { idempotent: true })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, FileSystem.downloadAsync(uri, fileURI, requestOption)];
                case 5:
                    response = _a.sent();
                    if (componentIsMounted.current && (response === null || response === void 0 ? void 0 : response.status) === 200) {
                        setImgUri("".concat(fileURI));
                    }
                    if ((response === null || response === void 0 ? void 0 : response.status) !== 200) {
                        FileSystem.deleteAsync(fileURI, { idempotent: true });
                    }
                    _a.label = 6;
                case 6: return [3 /*break*/, 8];
                case 7:
                    err_1 = _a.sent();
                    console.error("Error loading image:", err_1);
                    setImgUri(uri);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    }); };
    if (!imgUri)
        return placeholderContent || null;
    return (<Image {...rest} source={__assign(__assign({}, source), { uri: imgUri })}/>);
};
export var CacheManager = {
    addToCache: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey;
        var file = _b.file, key = _b.key;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedKey = CONST.sanitizeCacheKey(key);
                    return [4 /*yield*/, FileSystem.copyAsync({
                            from: file,
                            to: "".concat(CONST.IMAGE_CACHE_FOLDER).concat(sanitizedKey, ".png"),
                        })];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, CacheManager.getCachedUri({ key: key })];
                case 2: return [2 /*return*/, _c.sent()];
            }
        });
    }); },
    getCachedUri: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey;
        var key = _b.key;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedKey = CONST.sanitizeCacheKey(key);
                    return [4 /*yield*/, FileSystem.getContentUriAsync("".concat(CONST.IMAGE_CACHE_FOLDER).concat(sanitizedKey, ".png"))];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); },
    downloadAsync: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey;
        var uri = _b.uri, key = _b.key, options = _b.options;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedKey = CONST.sanitizeCacheKey(key);
                    return [4 /*yield*/, FileSystem.downloadAsync(uri, "".concat(CONST.IMAGE_CACHE_FOLDER).concat(sanitizedKey, ".png"), options)];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); },
};
export default CachedImage;
