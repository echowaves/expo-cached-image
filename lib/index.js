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
import { Directory, File } from "expo-file-system";
import React, { useEffect, useRef, useState } from "react";
import { Image } from "react-native";
import * as CONST from "./consts";
var CachedImage = function (props) {
    var source = props.source, cacheKey = props.cacheKey, placeholderContent = props.placeholderContent, rest = __rest(props, ["source", "cacheKey", "placeholderContent"]);
    var uri = source.uri, headers = source.headers, expiresIn = source.expiresIn;
    var sanitizedKey = CONST.sanitizeCacheKey(cacheKey);
    var file = new File(CONST.IMAGE_CACHE_FOLDER, "".concat(sanitizedKey, ".png"));
    var fileURI = file.uri;
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
        var metadata, expired, downloaded, err_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 4, , 5]);
                    metadata = file.info();
                    expired = Boolean(metadata.exists &&
                        expiresIn &&
                        (Date.now() - ((_a = metadata.modificationTime) !== null && _a !== void 0 ? _a : 0)) / 1000 > expiresIn);
                    if (!(!metadata.exists || ((_b = metadata.size) !== null && _b !== void 0 ? _b : 0) === 0 || expired)) return [3 /*break*/, 3];
                    return [4 /*yield*/, setImgUri(null)];
                case 1:
                    _c.sent();
                    if (!componentIsMounted.current) return [3 /*break*/, 3];
                    if (expired) {
                        file.delete();
                    }
                    return [4 /*yield*/, File.downloadFileAsync(uri, new Directory(CONST.IMAGE_CACHE_FOLDER), requestOption)
                        // Move/rename if the server selected a different filename
                    ];
                case 2:
                    downloaded = _c.sent();
                    // Move/rename if the server selected a different filename
                    if (downloaded.uri !== fileURI) {
                        new File(downloaded.uri).move(file);
                    }
                    if (componentIsMounted.current) {
                        setImgUri("".concat(fileURI));
                    }
                    _c.label = 3;
                case 3: return [3 /*break*/, 5];
                case 4:
                    err_1 = _c.sent();
                    console.error("Error loading image:", err_1);
                    setImgUri(uri);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
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
                    new File(file).copy(new File(CONST.IMAGE_CACHE_FOLDER, "".concat(sanitizedKey, ".png")));
                    return [4 /*yield*/, CacheManager.getCachedUri({ key: key })];
                case 1: return [2 /*return*/, _c.sent()];
            }
        });
    }); },
    getCachedUri: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey;
        var key = _b.key;
        return __generator(this, function (_c) {
            sanitizedKey = CONST.sanitizeCacheKey(key);
            return [2 /*return*/, new File(CONST.IMAGE_CACHE_FOLDER, "".concat(sanitizedKey, ".png")).uri];
        });
    }); },
    downloadAsync: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey, result, target;
        var uri = _b.uri, key = _b.key, options = _b.options;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sanitizedKey = CONST.sanitizeCacheKey(key);
                    return [4 /*yield*/, File.downloadFileAsync(uri, new Directory(CONST.IMAGE_CACHE_FOLDER), options)];
                case 1:
                    result = _c.sent();
                    target = new File(CONST.IMAGE_CACHE_FOLDER, "".concat(sanitizedKey, ".png"));
                    if (result.uri !== target.uri) {
                        new File(result.uri).move(target);
                    }
                    return [2 /*return*/, result];
            }
        });
    }); },
    getMetadata: function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
        var sanitizedKey, fileRef, fileURI, metadata;
        var _c, _d;
        var key = _b.key;
        return __generator(this, function (_e) {
            sanitizedKey = CONST.sanitizeCacheKey(key);
            fileRef = new File(CONST.IMAGE_CACHE_FOLDER, "".concat(sanitizedKey, ".png"));
            fileURI = fileRef.uri;
            try {
                metadata = fileRef.info();
                if (!metadata.exists) {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, {
                        exists: metadata.exists,
                        size: (_c = metadata.size) !== null && _c !== void 0 ? _c : 0,
                        modificationTime: new Date((_d = metadata.modificationTime) !== null && _d !== void 0 ? _d : 0),
                        uri: fileURI,
                        isDirectory: false,
                    }];
            }
            catch (err) {
                console.error("Error getting cache metadata:", err);
                return [2 /*return*/, null];
            }
            return [2 /*return*/];
        });
    }); },
};
export default CachedImage;
